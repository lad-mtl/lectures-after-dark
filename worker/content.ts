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
  isPast: boolean;
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
  PAYLOAD_CMS?: Fetcher;
  PAYLOAD_CONTENT_API_URL: string;
  PAYLOAD_TIMEOUT_MS?: string;
}

type ResourceDefinition<T> = CacheableResource & {
  pathname: string;
  normalize: (payload: unknown) => T;
};

type PayloadDocument<T> = {
  id?: number | string;
} & T;

type PayloadCollectionResponse<T> = {
  docs?: Array<PayloadDocument<T>> | null;
  errors?: Array<{ message?: string }>;
};

type PayloadEventData = {
  title?: string | null;
  startsAt?: string | null;
  locationLabel?: string | null;
  priceLabel?: string | null;
  imageUrl?: string | null;
  eventbriteUrl?: string | null;
  order?: number | null;
};

type PayloadInstagramPostData = {
  instagramId?: string | null;
  caption?: string | null;
  imageUrl?: string | null;
  mediaType?: string | null;
  permalink?: string | null;
  timestamp?: string | null;
  order?: number | null;
};

const DEFAULT_TIMEOUT_MS = 3000;

function normalizePayloadDocument<T extends Record<string, unknown>>(
  document: PayloadDocument<T>,
) {
  const source = document as T & {
    id?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
  };
  const rest = { ...source };

  delete rest.id;
  delete rest.createdAt;
  delete rest.updatedAt;

  return {
    ...rest,
    id: String(document.id ?? ""),
  };
}

function buildPayloadUrl(baseUrl: string, pathname: string) {
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

function normalizePayloadEvent(
  event: PayloadEventData & { id: string },
  now: number,
): EventData | null {
  const title = readString(event.title);
  const startsAt = readString(event.startsAt);
  const eventbriteUrl = readString(event.eventbriteUrl);
  const startsAtTimestamp = parseDate(startsAt);

  if (!title || !startsAt || !eventbriteUrl || !startsAtTimestamp) {
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
    isPast: startsAtTimestamp <= now,
  };
}

function normalizePayloadInstagramPost(
  post: PayloadInstagramPostData & { id: string },
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
    pathname: "/speakers?sort=order&limit=100&depth=0",
    normalize: (payload: unknown) => {
      const data = payload as PayloadCollectionResponse<Omit<SpeakerData, "id">>;

      return (data.docs ?? [])
        .map((document) => normalizePayloadDocument(document))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/venues": {
    cacheKey: "content:venues",
    pathname: "/venues?sort=order&limit=100&depth=0",
    normalize: (payload: unknown) => {
      const data = payload as PayloadCollectionResponse<Omit<VenueData, "id">>;

      return (data.docs ?? [])
        .map((document) => normalizePayloadDocument(document))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/speaker-page": {
    cacheKey: "content:speaker-page",
    pathname: "/globals/speaker-page?depth=0",
    normalize: (payload: unknown) => {
      const page = payload as PageCtaContent;

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
    pathname: "/globals/venue-page?depth=0",
    normalize: (payload: unknown) => {
      const page = payload as PageCtaContent;

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
    pathname: "/globals/faq?depth=0",
    normalize: (payload: unknown) => {
      const faq = payload as FaqData;

      return {
        items: (faq.items ?? []).map((item) =>
          item
            ? {
                question: item.question,
                answer: item.answer ?? null,
              }
            : null,
        ),
      };
    },
  },
  "/api/content/team-members": {
    cacheKey: "content:team-members",
    pathname: "/team-members?sort=order&limit=100&depth=0",
    normalize: (payload: unknown) => {
      const data = payload as PayloadCollectionResponse<Omit<TeamMemberData, "id">>;

      return (data.docs ?? [])
        .map((document) => normalizePayloadDocument(document))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  },
  "/api/content/events": {
    cacheKey: "content:events",
    pathname: "/events?sort=startsAt&limit=20&depth=0",
    normalize: (payload: unknown) => {
      const data = payload as PayloadCollectionResponse<PayloadEventData>;
      const now = Date.now();

      return (data.docs ?? [])
        .map((document) => normalizePayloadDocument(document))
        .map((event) => normalizePayloadEvent(event, now))
        .filter((event): event is EventData => Boolean(event))
        .sort((left, right) => (parseDate(left.startsAt) ?? 0) - (parseDate(right.startsAt) ?? 0));
    },
  },
  "/api/content/instagram": {
    cacheKey: "content:instagram",
    pathname: "/instagram-posts?sort=-timestamp&limit=6&depth=0",
    normalize: (payload: unknown) => {
      const data = payload as PayloadCollectionResponse<PayloadInstagramPostData>;

      return (data.docs ?? [])
        .map((document) => normalizePayloadDocument(document))
        .map((post) => normalizePayloadInstagramPost(post))
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
  const configuredTimeout = Number(env.PAYLOAD_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeoutMs =
    Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstreamUrl = buildPayloadUrl(env.PAYLOAD_CONTENT_API_URL, resource.pathname);
    const upstreamRequest = new Request(upstreamUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      redirect: "manual",
      signal: controller.signal,
    });
    const useServiceBinding =
      Boolean(env.PAYLOAD_CMS) &&
      new URL(env.PAYLOAD_CONTENT_API_URL).hostname === "cms.lecturesafterdark.ca";
    const response = useServiceBinding
      ? await env.PAYLOAD_CMS!.fetch(upstreamRequest)
      : await fetch(upstreamRequest);

    if (!response.ok) {
      throw new Error(`Payload upstream returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error("Payload upstream returned a non-JSON response");
    }

    const body = (await response.json()) as PayloadCollectionResponse<unknown>;

    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? "Unknown Payload error");
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
            error instanceof Error ? error.message : "payload-unreachable",
        },
      });
    }

    return jsonResponse(
      { error: "Payload content is unavailable and no cached fallback exists." },
      { status: 503 },
    );
  }
}
