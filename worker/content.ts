interface CachedSnapshot<T> {
  data: T;
  fetchedAt: string;
}

export interface SpeakerData {
  id: string;
  name: string;
  topic?: string | null;
  bio?: string | null;
  image?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  website?: string | null;
  order?: number | null;
}

export interface VenueData {
  id: string;
  name: string;
  neighborhood: string;
  description?: string | null;
  imageUrl?: string | null;
  mapsLink?: string | null;
  order?: number | null;
}

export interface FaqData {
  items?: Array<{
    question: string;
    answer?: string | null;
  } | null> | null;
}

export interface ContentEnv {
  CONTENT_CACHE?: KVNamespace;
  TINA_CONTENT_API_URL: string;
  TINA_CONTENT_API_TOKEN?: string;
  TINA_TIMEOUT_MS?: string;
}

type ResourceDefinition<T> = {
  cacheKey: string;
  query: string;
  normalize: (payload: unknown) => T;
};

const DEFAULT_TIMEOUT_MS = 3000;

const resources = {
  "/api/content/speakers": {
    cacheKey: "content:speakers",
    query: `query {
      speakerConnection {
        edges {
          node {
            id
            name
            topic
            bio
            image
            twitter
            linkedin
            website
            order
          }
        }
      }
    }`,
    normalize: (payload: unknown) => {
      const data = payload as {
        speakerConnection?: { edges?: Array<{ node: SpeakerData | null }> };
      };

      return (data.speakerConnection?.edges ?? [])
        .map((edge) => edge.node)
        .filter((node): node is SpeakerData => Boolean(node))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/venues": {
    cacheKey: "content:venues",
    query: `query {
      venueConnection {
        edges {
          node {
            id
            name
            neighborhood
            description
            imageUrl
            mapsLink
            order
          }
        }
      }
    }`,
    normalize: (payload: unknown) => {
      const data = payload as {
        venueConnection?: { edges?: Array<{ node: VenueData | null }> };
      };

      return (data.venueConnection?.edges ?? [])
        .map((edge) => edge.node)
        .filter((node): node is VenueData => Boolean(node))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/faq": {
    cacheKey: "content:faq",
    query: `query {
      faq(relativePath: "faq.json") {
        items {
          question
          answer
        }
      }
    }`,
    normalize: (payload: unknown) => {
      const data = payload as { faq?: FaqData | null };
      return data.faq ?? { items: [] };
    },
  },
} satisfies Record<string, ResourceDefinition<unknown>>;

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

async function writeSnapshot(
  env: ContentEnv,
  resource: ResourceDefinition<unknown>,
  data: unknown,
  fetchedAt: string,
) {
  if (!env.CONTENT_CACHE) {
    return;
  }

  const snapshot: CachedSnapshot<unknown> = { data, fetchedAt };
  await env.CONTENT_CACHE.put(resource.cacheKey, JSON.stringify(snapshot));
}

async function readSnapshot(
  env: ContentEnv,
  resource: ResourceDefinition<unknown>,
) {
  if (!env.CONTENT_CACHE) {
    return null;
  }

  return env.CONTENT_CACHE.get(resource.cacheKey, "json") as Promise<
    CachedSnapshot<unknown> | null
  >;
}

async function fetchFreshContent(
  env: ContentEnv,
  resource: ResourceDefinition<unknown>,
) {
  const controller = new AbortController();
  const timeoutMs = Number(env.TINA_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers({
      "content-type": "application/json",
      accept: "application/json",
    });

    if (env.TINA_CONTENT_API_TOKEN) {
      headers.set("authorization", `Bearer ${env.TINA_CONTENT_API_TOKEN}`);
    }

    const response = await fetch(env.TINA_CONTENT_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: resource.query }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Tina upstream returned ${response.status}`);
    }

    const body = (await response.json()) as {
      data?: unknown;
      errors?: Array<{ message?: string }>;
    };

    if (body.errors?.length) {
      throw new Error(
        body.errors.map((error) => error.message ?? "Unknown Tina error").join("; "),
      );
    }

    const normalized = resource.normalize(body.data ?? {});
    const fetchedAt = new Date().toISOString();

    await writeSnapshot(env, resource, normalized, fetchedAt);

    return jsonResponse(normalized, {
      headers: {
        "x-content-source": "live",
        "x-content-fetched-at": fetchedAt,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleContentRequest(request: Request, env: ContentEnv) {
  const pathname = new URL(request.url).pathname;
  const resource = resources[pathname as keyof typeof resources];

  if (!resource) {
    return null;
  }

  try {
    return await fetchFreshContent(env, resource);
  } catch (error) {
    const snapshot = await readSnapshot(env, resource);

    if (snapshot) {
      return jsonResponse(snapshot.data, {
        headers: {
          "x-content-source": "stale-cache",
          "x-content-fetched-at": snapshot.fetchedAt,
          "x-content-fallback-reason":
            error instanceof Error ? error.message : "tina-unreachable",
        },
      });
    }

    return jsonResponse(
      { error: "Tina content is unavailable and no cached fallback exists." },
      { status: 503 },
    );
  }
}

