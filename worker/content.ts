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
  STRAPI_CONTENT_API_URL: string;
  STRAPI_CONTENT_API_TOKEN?: string;
  STRAPI_TIMEOUT_MS?: string;
}

type ResourceDefinition<T> = {
  cacheKey: string;
  pathname: string;
  normalize: (payload: unknown) => T;
};

type StrapiEntity<T> = {
  id?: number | string;
  documentId?: string;
  attributes?: T;
} & T;

const DEFAULT_TIMEOUT_MS = 3000;

function normalizeStrapiEntity<T extends Record<string, unknown>>(entity: StrapiEntity<T>) {
  const source = (entity.attributes ?? entity) as T;
  const { id: _id, documentId: _documentId, attributes: _attributes, ...rest } =
    source as T & {
      id?: unknown;
      documentId?: unknown;
      attributes?: unknown;
    };

  return {
    ...rest,
    id: String(entity.documentId ?? entity.id ?? ""),
  };
}

function buildStrapiUrl(baseUrl: string, pathname: string) {
  return `${baseUrl.replace(/\/+$/, "")}${pathname}`;
}

const resources = {
  "/api/content/speakers": {
    cacheKey: "content:speakers",
    pathname:
      "/speakers?sort[0]=order:asc&pagination[pageSize]=100&fields[0]=name&fields[1]=topic&fields[2]=bio&fields[3]=image&fields[4]=twitter&fields[5]=linkedin&fields[6]=website&fields[7]=order",
    normalize: (payload: unknown) => {
      const data = payload as { data?: Array<StrapiEntity<Omit<SpeakerData, "id">>> | null };

      return (data.data ?? [])
        .map((node) => normalizeStrapiEntity(node))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/venues": {
    cacheKey: "content:venues",
    pathname:
      "/venues?sort[0]=order:asc&pagination[pageSize]=100&fields[0]=name&fields[1]=neighborhood&fields[2]=description&fields[3]=imageUrl&fields[4]=mapsLink&fields[5]=order",
    normalize: (payload: unknown) => {
      const data = payload as { data?: Array<StrapiEntity<Omit<VenueData, "id">>> | null };

      return (data.data ?? [])
        .map((node) => normalizeStrapiEntity(node))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/faq": {
    cacheKey: "content:faq",
    pathname: "/faq?populate[items][fields][0]=question&populate[items][fields][1]=answer",
    normalize: (payload: unknown) => {
      const data = payload as { data?: StrapiEntity<FaqData> | null };
      const entity = data.data;

      if (!entity) {
        return { items: [] };
      }

      const faq = entity.attributes ?? entity;
      return { items: faq.items ?? [] };
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
  const timeoutMs = Number(env.STRAPI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers({
      accept: "application/json",
    });

    if (env.STRAPI_CONTENT_API_TOKEN) {
      headers.set("authorization", `Bearer ${env.STRAPI_CONTENT_API_TOKEN}`);
    }

    const response = await fetch(buildStrapiUrl(env.STRAPI_CONTENT_API_URL, resource.pathname), {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Strapi upstream returned ${response.status}`);
    }

    const body = (await response.json()) as { data?: unknown; error?: { message?: string } };

    if (body.error) {
      throw new Error(body.error.message ?? "Unknown Strapi error");
    }

    const normalized = resource.normalize(body);
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
            error instanceof Error ? error.message : "strapi-unreachable",
        },
      });
    }

    return jsonResponse(
      { error: "Strapi content is unavailable and no cached fallback exists." },
      { status: 503 },
    );
  }
}
