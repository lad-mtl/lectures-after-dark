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

export interface ContentEnv {
  CONTENT_CACHE?: KVNamespace;
  STRAPI_CONTENT_API_URL: string;
  STRAPI_CONTENT_API_TOKEN?: string;
  STRAPI_TIMEOUT_MS?: string;
  EVENTBRITE_API_BASE_URL?: string;
  EVENTBRITE_PRIVATE_TOKEN?: string;
  EVENTBRITE_ORGANIZER_ID?: string;
  EVENTBRITE_TIMEOUT_MS?: string;
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

type EventbriteMoney = {
  currency?: string | null;
  display?: string | null;
  major_value?: string | null;
  value?: number | string | null;
};

type EventbriteEvent = {
  id?: number | string;
  url?: string | null;
  status?: string | null;
  listed?: boolean | null;
  online_event?: boolean | null;
  is_free?: boolean | null;
  name?: {
    text?: string | null;
  } | null;
  start?: {
    utc?: string | null;
    local?: string | null;
    timezone?: string | null;
  } | null;
  logo?: {
    url?: string | null;
    original?: {
      url?: string | null;
    } | null;
  } | null;
  venue?: {
    name?: string | null;
    address?: {
      localized_area_display?: string | null;
      localized_address_display?: string | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
    } | null;
  } | null;
  ticket_availability?: {
    is_sold_out?: boolean | null;
    minimum_ticket_price?: EventbriteMoney | null;
    maximum_ticket_price?: EventbriteMoney | null;
  } | null;
  media?: unknown;
  image?: unknown;
  images?: unknown;
  event_media?: unknown;
};

type EventbriteEventsResponse = {
  events?: EventbriteEvent[] | null;
};

const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_EVENTBRITE_API_BASE_URL = "https://www.eventbriteapi.com/v3";
const EVENTS_CACHE_RESOURCE: CacheableResource = {
  cacheKey: "content:events",
};

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

function buildEventbriteUrl(baseUrl: string, organizerId: string) {
  return `${baseUrl.replace(/\/+$/, "")}/organizations/${encodeURIComponent(organizerId)}/events/`;
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

function formatMoney(amount?: EventbriteMoney | null) {
  if (!amount) {
    return null;
  }

  if (amount.display?.trim()) {
    return amount.display.trim();
  }

  const currency = amount.currency?.trim();
  const majorValue = amount.major_value?.trim();

  if (currency && majorValue) {
    const parsed = Number(majorValue);

    if (Number.isFinite(parsed)) {
      return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency,
      }).format(parsed);
    }
  }

  return null;
}

function formatPriceLabel(event: EventbriteEvent) {
  if (event.ticket_availability?.is_sold_out) {
    return "Sold out";
  }

  if (event.is_free) {
    return "Free";
  }

  const minimum = formatMoney(event.ticket_availability?.minimum_ticket_price);
  const maximum = formatMoney(event.ticket_availability?.maximum_ticket_price);

  if (minimum && maximum && minimum !== maximum) {
    return `${minimum} - ${maximum}`;
  }

  return minimum ?? "See tickets";
}

function formatLocationLabel(event: EventbriteEvent) {
  if (event.online_event) {
    return "Online";
  }

  const address = event.venue?.address;
  const area =
    address?.localized_area_display?.trim() ??
    [address?.city?.trim(), address?.region?.trim()].filter(Boolean).join(", ");

  if (area) {
    return area;
  }

  const venueName = event.venue?.name?.trim();

  if (venueName) {
    return venueName;
  }

  const addressDisplay = address?.localized_address_display?.trim();

  return addressDisplay || "Location TBA";
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isVideoMedia(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const media = value as Record<string, unknown>;
  const joined = [
    readString(media.type),
    readString(media.kind),
    readString(media.media_type),
    readString(media.mime_type),
    readString(media.file_type),
    readString(media.url),
    readString((media.original as Record<string, unknown> | undefined)?.url),
  ]
    .join(" ")
    .toLowerCase();

  return joined.includes("video") || joined.includes(".mp4") || joined.includes(".mov");
}

function extractMediaUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const media = value as Record<string, unknown>;
  const candidates = [
    readString(media.url),
    readString((media.original as Record<string, unknown> | undefined)?.url),
    readString((media.image as Record<string, unknown> | undefined)?.url),
    readString(
      ((media.image as Record<string, unknown> | undefined)?.original as Record<string, unknown> | undefined)
        ?.url,
    ),
  ];

  return candidates.find(Boolean) ?? null;
}

function firstNonVideoMediaUrl(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return null;
  }

  for (const item of value) {
    if (isVideoMedia(item)) {
      continue;
    }

    const url = extractMediaUrl(item);

    if (url) {
      return url;
    }
  }

  return null;
}

function getEventImageUrl(event: EventbriteEvent) {
  const mediaCandidates = [
    firstNonVideoMediaUrl(event.media),
    firstNonVideoMediaUrl(event.images),
    firstNonVideoMediaUrl(event.event_media),
    !isVideoMedia(event.image) ? extractMediaUrl(event.image) : null,
    !isVideoMedia(event.logo) ? extractMediaUrl(event.logo) : null,
  ];

  return mediaCandidates.find(Boolean) ?? null;
}

function isUpcomingEvent(event: EventbriteEvent, now: number) {
  const startsAt = parseDate(event.start?.utc) ?? parseDate(event.start?.local);
  const status = event.status?.toLowerCase().trim();

  if (!startsAt || startsAt <= now) {
    return false;
  }

  if (!event.url?.trim()) {
    return false;
  }

  if (event.listed === false) {
    return false;
  }

  return !["canceled", "completed", "ended", "draft"].includes(status ?? "");
}

function normalizeEventbriteEvent(event: EventbriteEvent): EventData | null {
  const startsAt = event.start?.utc?.trim() || event.start?.local?.trim();
  const title = event.name?.text?.trim();
  const eventbriteUrl = event.url?.trim();

  if (!startsAt || !title || !eventbriteUrl) {
    return null;
  }

  const { day, month, timeLabel } = formatEventStartParts(
    startsAt,
    event.start?.timezone,
  );

  return {
    id: String(event.id ?? eventbriteUrl),
    title,
    startsAt,
    day,
    month,
    timeLabel,
    locationLabel: formatLocationLabel(event),
    priceLabel: formatPriceLabel(event),
    imageUrl: getEventImageUrl(event),
    eventbriteUrl,
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

async function fetchFreshEvents(env: ContentEnv) {
  const organizerId = env.EVENTBRITE_ORGANIZER_ID?.trim();
  const token = env.EVENTBRITE_PRIVATE_TOKEN?.trim();

  if (!organizerId || !token) {
    throw new Error("Eventbrite configuration is missing.");
  }

  const controller = new AbortController();
  const timeoutMs = Number(env.EVENTBRITE_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const baseUrl = env.EVENTBRITE_API_BASE_URL?.trim() || DEFAULT_EVENTBRITE_API_BASE_URL;
    const url = new URL(buildEventbriteUrl(baseUrl, organizerId));

    url.searchParams.set("status", "live");
    url.searchParams.set("time_filter", "current_future");
    url.searchParams.set("order_by", "start_asc");
    url.searchParams.set("expand", "ticket_availability,venue");
    url.searchParams.set("page_size", "20");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Eventbrite upstream returned ${response.status}`);
    }

    const body = (await response.json()) as EventbriteEventsResponse;
    const now = Date.now();

    const events = (body.events ?? [])
      .filter((event) => isUpcomingEvent(event, now))
      .sort((left, right) => {
        const leftStart = parseDate(left.start?.utc) ?? parseDate(left.start?.local) ?? 0;
        const rightStart = parseDate(right.start?.utc) ?? parseDate(right.start?.local) ?? 0;

        return leftStart - rightStart;
      })
      .map((event) => normalizeEventbriteEvent(event))
      .filter((event): event is EventData => Boolean(event));

    const fetchedAt = new Date().toISOString();
    await writeSnapshot(env, EVENTS_CACHE_RESOURCE, events, fetchedAt);

    return jsonResponse(events, {
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

  if (pathname === "/api/content/events") {
    try {
      return await fetchFreshEvents(env);
    } catch (error) {
      const snapshot = await readSnapshot(env, EVENTS_CACHE_RESOURCE);

      if (snapshot) {
        return jsonResponse(snapshot.data, {
          headers: {
            "x-content-source": "stale-cache",
            "x-content-fetched-at": snapshot.fetchedAt,
            "x-content-fallback-reason":
              error instanceof Error ? error.message : "eventbrite-unreachable",
          },
        });
      }

      return jsonResponse(
        { error: "Eventbrite content is unavailable and no cached fallback exists." },
        { status: 503 },
      );
    }
  }

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
