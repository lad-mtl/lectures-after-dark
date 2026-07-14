interface CachedSnapshot<T> {
  data: T;
  fetchedAt: string;
}

interface CacheableResource {
  cacheKey: string;
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

export interface PageCtaContent {
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaButtonText?: string | null;
  ctaButtonLink?: string | null;
}

export interface FaqData {
  items?: Array<{
    question: string;
    answer?: string | null;
  } | null> | null;
}

export interface EventData {
  id: string;
  title: string;
  startsAt: string;
  day: string;
  month: string;
  timeLabel: string;
  locationLabel: string;
  priceLabel: string;
  imageUrl: string | null;
  eventbriteUrl: string;
}

export interface TeamMemberData {
  id: string;
  name: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  order?: number | null;
}

export interface InstagramPostData {
  id: string;
  caption?: string | null;
  imageUrl: string;
  mediaType?: string | null;
  permalink: string;
  timestamp?: string | null;
}

export interface ContentEnv {
  CONTENT_CACHE?: KVNamespace;
  STRAPI_CONTENT_API_URL: string;
  STRAPI_CONTENT_API_TOKEN?: string;
  STRAPI_TIMEOUT_MS?: string;
}

type ResourceDefinition<T> = CacheableResource & {
  pathname: string;
  normalize: (payload: unknown) => T;
};

type StrapiEntity<T> = {
  id?: number | string;
  documentId?: string;
  attributes?: T;
} & T;

type StrapiEventData = {
  title?: string | null;
  startsAt?: string | null;
  locationLabel?: string | null;
  priceLabel?: string | null;
  imageUrl?: string | null;
  eventbriteUrl?: string | null;
  order?: number | null;
};

type StrapiInstagramPostData = {
  instagramId?: string | null;
  caption?: string | null;
  imageUrl?: string | null;
  mediaType?: string | null;
  permalink?: string | null;
  timestamp?: string | null;
  order?: number | null;
};

const DEFAULT_TIMEOUT_MS = 3000;

function normalizeStrapiEntity<T extends Record<string, unknown>>(entity: StrapiEntity<T>) {
  const source = (entity.attributes ?? entity) as T & {
    id?: unknown;
    documentId?: unknown;
    attributes?: unknown;
  };
  const rest = { ...source };

  delete rest.id;
  delete rest.documentId;
  delete rest.attributes;

  return {
    ...rest,
    id: String(entity.documentId ?? entity.id ?? ""),
  };
}

function buildStrapiUrl(baseUrl: string, pathname: string) {
  return `${baseUrl.replace(/\/+$/, "")}${pathname}`;
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function formatEventStartParts(startsAt: string, timeZone?: string | null) {
  const date = new Date(startsAt);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "",
      month: "",
      timeLabel: "Time TBA",
    };
  }

  const dateOptions = timeZone ? { timeZone } : undefined;
  const day = new Intl.DateTimeFormat("en-US", {
    ...dateOptions,
    day: "2-digit",
  }).format(date);
  const month = new Intl.DateTimeFormat("en-US", {
    ...dateOptions,
    month: "short",
  })
    .format(date)
    .toUpperCase();
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    ...dateOptions,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return { day, month, timeLabel };
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStrapiEvent(
  event: StrapiEventData & { id: string },
  now: number,
): EventData | null {
  const title = readString(event.title);
  const startsAt = readString(event.startsAt);
  const eventbriteUrl = readString(event.eventbriteUrl);
  const startsAtTimestamp = parseDate(startsAt);

  if (!title || !startsAt || !eventbriteUrl || !startsAtTimestamp || startsAtTimestamp <= now) {
    return null;
  }

  const { day, month, timeLabel } = formatEventStartParts(startsAt);

  return {
    id: event.id || eventbriteUrl,
    title,
    startsAt,
    day,
    month,
    timeLabel,
    locationLabel: readString(event.locationLabel) || "Location TBA",
    priceLabel: readString(event.priceLabel) || "See tickets",
    imageUrl: readString(event.imageUrl) || null,
    eventbriteUrl,
  };
}

function normalizeStrapiInstagramPost(
  post: StrapiInstagramPostData & { id: string },
): InstagramPostData | null {
  const imageUrl = readString(post.imageUrl);
  const permalink = readString(post.permalink);

  if (!imageUrl || !permalink) {
    return null;
  }

  return {
    id: readString(post.instagramId) || post.id || permalink,
    caption: readString(post.caption) || null,
    imageUrl,
    mediaType: readString(post.mediaType).toUpperCase() || null,
    permalink,
    timestamp: readString(post.timestamp) || null,
  };
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
  "/api/content/speaker-page": {
    cacheKey: "content:speaker-page",
    pathname:
      "/speaker-page?fields[0]=ctaTitle&fields[1]=ctaDescription&fields[2]=ctaButtonText&fields[3]=ctaButtonLink",
    normalize: (payload: unknown) => {
      const data = payload as { data?: StrapiEntity<PageCtaContent> | null };
      const entity = data.data;

      if (!entity) {
        return {};
      }

      const page = entity.attributes ?? entity;
      return {
        ctaTitle: page.ctaTitle ?? null,
        ctaDescription: page.ctaDescription ?? null,
        ctaButtonText: page.ctaButtonText ?? null,
        ctaButtonLink: page.ctaButtonLink ?? null,
      };
    },
  },
  "/api/content/venue-page": {
    cacheKey: "content:venue-page",
    pathname:
      "/venue-page?fields[0]=ctaTitle&fields[1]=ctaDescription&fields[2]=ctaButtonText&fields[3]=ctaButtonLink",
    normalize: (payload: unknown) => {
      const data = payload as { data?: StrapiEntity<PageCtaContent> | null };
      const entity = data.data;

      if (!entity) {
        return {};
      }

      const page = entity.attributes ?? entity;
      return {
        ctaTitle: page.ctaTitle ?? null,
        ctaDescription: page.ctaDescription ?? null,
        ctaButtonText: page.ctaButtonText ?? null,
        ctaButtonLink: page.ctaButtonLink ?? null,
      };
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
  "/api/content/team-members": {
    cacheKey: "content:team-members",
    pathname:
      "/team-members?sort[0]=order:asc&pagination[pageSize]=100&fields[0]=name&fields[1]=title&fields[2]=description&fields[3]=image&fields[4]=linkUrl&fields[5]=linkText&fields[6]=order",
    normalize: (payload: unknown) => {
      const data = payload as { data?: Array<StrapiEntity<Omit<TeamMemberData, "id">>> | null };

      return (data.data ?? [])
        .map((node) => normalizeStrapiEntity(node))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/events": {
    cacheKey: "content:events",
    pathname:
      "/events?sort[0]=startsAt:asc&pagination[pageSize]=20&fields[0]=title&fields[1]=startsAt&fields[2]=locationLabel&fields[3]=priceLabel&fields[4]=imageUrl&fields[5]=eventbriteUrl&fields[6]=order",
    normalize: (payload: unknown) => {
      const data = payload as { data?: Array<StrapiEntity<StrapiEventData>> | null };
      const now = Date.now();

      return (data.data ?? [])
        .map((node) => normalizeStrapiEntity(node))
        .map((event) => normalizeStrapiEvent(event, now))
        .filter((event): event is EventData => Boolean(event))
        .sort((left, right) => (parseDate(left.startsAt) ?? 0) - (parseDate(right.startsAt) ?? 0));
    },
  },
  "/api/content/instagram": {
    cacheKey: "content:instagram",
    pathname:
      "/instagram-posts?sort[0]=timestamp:desc&pagination[pageSize]=6&fields[0]=instagramId&fields[1]=caption&fields[2]=imageUrl&fields[3]=mediaType&fields[4]=permalink&fields[5]=timestamp&fields[6]=order",
    normalize: (payload: unknown) => {
      const data = payload as { data?: Array<StrapiEntity<StrapiInstagramPostData>> | null };

      return (data.data ?? [])
        .map((node) => normalizeStrapiEntity(node))
        .map((post) => normalizeStrapiInstagramPost(post))
        .filter((post): post is InstagramPostData => Boolean(post));
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
  resource: CacheableResource,
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
  resource: CacheableResource,
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
