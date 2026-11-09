import { runEventbriteRefresh, EventbriteContentError, eventbriteRetryAfter, cachedEventbriteOrganization } from './eventbrite-refresh.ts';
import { enrichEvents, payloadCollection } from './payload-content.ts';
import { refreshEventDates } from "../src/lib/eventDates.ts";

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
  imageCredit?: string | null;
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
  description?: string | null;
  topic?: string | null;
  recordingUrl?: string | null;
  resourcesUrl?: string | null;
  speakerIds?: string[];
  speakerNames?: string[];
  gallery?: string[];
}

export interface TeamMemberData {
  id: string;
  name: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  imageCredit?: string | null;
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
  NEWSLETTER_DB?: D1Database;
  CONTENT_CACHE?: KVNamespace;
  PAYLOAD_CMS?: Fetcher;
  PAYLOAD_CONTENT_API_URL: string;
  PAYLOAD_TIMEOUT_MS?: string;
  EVENTBRITE_API_BASE_URL?: string;
  EVENTBRITE_PRIVATE_TOKEN?: string;
  EVENTBRITE_ORGANIZATION_ID?: string;
  EVENTBRITE_ORGANIZATION_NAME?: string;
  EVENTBRITE_TIMEOUT_MS?: string;
  INSTAGRAM_API_BASE_URL?: string;
  INSTAGRAM_ACCESS_TOKEN?: string;
  INSTAGRAM_POSTS_LIMIT?: string;
  INSTAGRAM_TIMEOUT_MS?: string;
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
  pagination?: {
    continuation?: string | null;
    has_more_items?: boolean | null;
  } | null;
};

type EventbriteOrganization = {
  id?: number | string;
  name?: string | null;
};

type EventbriteOrganizationsResponse = {
  organizations?: EventbriteOrganization[] | null;
};

type InstagramChildMedia = {
  media_type?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
};

type InstagramMedia = {
  id?: number | string;
  caption?: string | null;
  media_type?: string | null;
  media_url?: string | null;
  permalink?: string | null;
  thumbnail_url?: string | null;
  timestamp?: string | null;
  children?: {
    data?: InstagramChildMedia[] | null;
  } | null;
};

type InstagramMediaResponse = {
  data?: InstagramMedia[] | null;
};

const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_EVENTBRITE_API_BASE_URL = "https://www.eventbriteapi.com/v3";
const DEFAULT_INSTAGRAM_API_BASE_URL = "https://graph.instagram.com";
const EVENTS_CACHE_RESOURCE: CacheableResource = {
  cacheKey: "content:events",
};
const INSTAGRAM_CACHE_RESOURCE: CacheableResource = {
  cacheKey: "content:instagram",
};

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

function buildEventbriteUrl(baseUrl: string, organizationId: string) {
  return `${baseUrl.replace(/\/+$/, "")}/organizations/${encodeURIComponent(organizationId)}/events/`;
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
    readString((media.original as Record<string, unknown> | undefined)?.url),
    readString(media.url),
    readString(
      ((media.image as Record<string, unknown> | undefined)?.original as Record<string, unknown> | undefined)
        ?.url,
    ),
    readString((media.image as Record<string, unknown> | undefined)?.url),
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

  const imageUrl = mediaCandidates.find(Boolean);

  return imageUrl ?? null;
}

function getInstagramChildImageUrl(media: InstagramMedia) {
  const children = media.children?.data ?? [];

  for (const child of children) {
    const imageUrl = readString(child.media_url) || readString(child.thumbnail_url);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return null;
}

function getInstagramImageUrl(media: InstagramMedia) {
  const mediaType = readString(media.media_type).toUpperCase();
  const mediaUrl = readString(media.media_url);
  const thumbnailUrl = readString(media.thumbnail_url);

  if (mediaType === "VIDEO") {
    return thumbnailUrl || mediaUrl || null;
  }

  if (mediaType === "CAROUSEL_ALBUM") {
    return mediaUrl || thumbnailUrl || getInstagramChildImageUrl(media);
  }

  return mediaUrl || thumbnailUrl || getInstagramChildImageUrl(media);
}

function normalizeInstagramMedia(media: InstagramMedia): InstagramPostData | null {
  const imageUrl = getInstagramImageUrl(media);
  const permalink = readString(media.permalink);
  const mediaType = readString(media.media_type).toUpperCase() || null;

  if (!imageUrl || !permalink) {
    return null;
  }

  return {
    id: String(media.id ?? permalink),
    caption: readString(media.caption) || null,
    imageUrl,
    mediaType,
    permalink,
    timestamp: readString(media.timestamp) || null,
  };
}

function isDisplayableEvent(event: EventbriteEvent) {
  const startsAt = parseDate(event.start?.utc) ?? parseDate(event.start?.local);
  const status = event.status?.toLowerCase().trim();

  if (!startsAt) {
    return false;
  }

  if (!event.url?.trim()) {
    return false;
  }

  if (event.listed === false) {
    return false;
  }

  return !["canceled", "draft"].includes(status ?? "");
}

function normalizeEventbriteEvent(event: EventbriteEvent, now: number): EventData | null {
  const startsAt = event.start?.utc?.trim() || event.start?.local?.trim();
  const title = event.name?.text?.trim();
  const eventbriteUrl = event.url?.trim();
  const startsAtTimestamp = parseDate(startsAt);

  if (!startsAt || !title || !eventbriteUrl || !startsAtTimestamp) {
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
    isPast: startsAtTimestamp <= now,
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
  try { await env.CONTENT_CACHE.put(resource.cacheKey, JSON.stringify(snapshot)); } catch { /* Fresh content is still usable when KV is unavailable. */ }
}

async function readSnapshot(
  env: ContentEnv,
  resource: CacheableResource,
) {
  if (!env.CONTENT_CACHE) {
    return null;
  }

  try {
    return await env.CONTENT_CACHE.get(resource.cacheKey, 'json') as CachedSnapshot<unknown> | null;
  } catch { return null; }
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

async function fetchEventbriteJson<T>(url: URL, token: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new EventbriteContentError(`eventbrite-http-${response.status}`, response.status === 429 ? eventbriteRetryAfter(response.headers.get("retry-after")) : 0);
    }

    return await response.json() as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function discoverEventbriteOrganizationId(
  env: ContentEnv,
  baseUrl: string,
  token: string,
  timeoutMs: number,
) {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/users/me/organizations/`);

  const body = await fetchEventbriteJson<EventbriteOrganizationsResponse>(url, token, timeoutMs);
  const organizations = (body.organizations ?? []).filter(
    (organization) => organization.id !== undefined && organization.id !== null,
  );
  const preferredName = readString(env.EVENTBRITE_ORGANIZATION_NAME) || "Lectures After Dark";
  const matchingOrganization = organizations.find(
    (organization) => readString(organization.name).toLowerCase() === preferredName.toLowerCase(),
  );

  if (matchingOrganization?.id !== undefined && matchingOrganization.id !== null) {
    return String(matchingOrganization.id);
  }

  throw new EventbriteContentError("eventbrite-organization-not-found");
}

export async function refreshScheduledEvents(env: ContentEnv): Promise<void> {
  await runEventbriteRefresh(env, () => fetchFreshEvents(env));
}

async function fetchFreshEvents(env: ContentEnv) {
  const token = env.EVENTBRITE_PRIVATE_TOKEN?.trim();

  if (!token) {
    throw new EventbriteContentError("eventbrite-token-missing");
  }

  const configuredTimeout = Number(env.EVENTBRITE_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? Math.min(configuredTimeout, 10_000) : DEFAULT_TIMEOUT_MS;

  const baseUrl = env.EVENTBRITE_API_BASE_URL?.trim() || DEFAULT_EVENTBRITE_API_BASE_URL;
  const organizationId =
    env.EVENTBRITE_ORGANIZATION_ID?.trim() ||
    (await cachedEventbriteOrganization(env, baseUrl, token, () => discoverEventbriteOrganizationId(env, baseUrl, token, timeoutMs)));
  const url = new URL(buildEventbriteUrl(baseUrl, organizationId));

  url.searchParams.set("time_filter", "all");
  url.searchParams.set("expand", "ticket_availability,venue");
  url.searchParams.set("order_by", "start_desc");
  url.searchParams.set("page_size", "50");

  const eventbriteEvents: EventbriteEvent[] = [];
  const seenContinuations = new Set<string>();
  let continuation: string | null = null;

  do {
    if (continuation) {
      url.searchParams.set("continuation", continuation);
    }

    const body = await fetchEventbriteJson<EventbriteEventsResponse>(url, token, timeoutMs);
    if (!body || !Array.isArray(body.events)) throw new EventbriteContentError('eventbrite-invalid-response');
    if (seenContinuations.size >= 100) throw new EventbriteContentError('eventbrite-pagination-limit');
    eventbriteEvents.push(...body.events);

    const nextContinuation = body.pagination?.continuation?.trim() || null;

    if (!body.pagination?.has_more_items) {
      break;
    }

    if (!nextContinuation || seenContinuations.has(nextContinuation)) {
      throw new EventbriteContentError("eventbrite-invalid-pagination");
    }

    seenContinuations.add(nextContinuation);
    continuation = nextContinuation;
  } while (continuation);

  const now = Date.now();

  const events = eventbriteEvents
    .filter((event) => isDisplayableEvent(event))
    .sort((left, right) => {
      const leftStart = parseDate(left.start?.utc) ?? parseDate(left.start?.local) ?? 0;
      const rightStart = parseDate(right.start?.utc) ?? parseDate(right.start?.local) ?? 0;

      return rightStart - leftStart;
    })
    .map((event) => normalizeEventbriteEvent(event, now))
    .filter((event): event is EventData => Boolean(event));

  const enriched = await enrichEvents(events, env);
  const fetchedAt = new Date(Date.now()).toISOString();
  await env.CONTENT_CACHE!.put(EVENTS_CACHE_RESOURCE.cacheKey, JSON.stringify({ data: enriched, fetchedAt }));

}

async function fetchFreshInstagram(env: ContentEnv) {
  const controller = new AbortController();
  const timeoutMs = Number(env.INSTAGRAM_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const limit = Number(env.INSTAGRAM_POSTS_LIMIT ?? "6");
    const normalizedLimit = String(Number.isFinite(limit) && limit > 0 ? limit : 6);
    const userAccessToken = env.INSTAGRAM_ACCESS_TOKEN?.trim();

    if (!userAccessToken) {
      throw new Error("Instagram configuration is missing.");
    }

    const baseUrl = env.INSTAGRAM_API_BASE_URL?.trim() || DEFAULT_INSTAGRAM_API_BASE_URL;
    const url = new URL(`${baseUrl.replace(/\/+$/, "")}/me/media`);

    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_type,media_url,thumbnail_url}",
    );
    url.searchParams.set("limit", normalizedLimit);
    url.searchParams.set("access_token", userAccessToken);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Instagram upstream returned ${response.status}`);
    }

    const body = (await response.json()) as InstagramMediaResponse;
    const posts = (body.data ?? [])
      .map((media) => normalizeInstagramMedia(media))
      .filter((post): post is InstagramPostData => Boolean(post));

    const fetchedAt = new Date().toISOString();
    await writeSnapshot(env, INSTAGRAM_CACHE_RESOURCE, posts, fetchedAt);

    return jsonResponse(posts, {
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
  if (!['GET', 'HEAD'].includes(request.method)) return jsonResponse({ error: 'Method not allowed.' }, { status: 405, headers: { allow: 'GET, HEAD' } });
  const kind = pathname.slice('/api/content/'.length);
  if (['speakers', 'team-members', 'topics'].includes(kind)) return payloadCollection(env, kind as 'speakers' | 'team-members' | 'topics');

  if (pathname === "/api/content/events") {
    const snapshot = await readSnapshot(env, EVENTS_CACHE_RESOURCE);
    const valid = snapshot && Array.isArray(snapshot.data) && typeof snapshot.fetchedAt === "string";
    const age = valid ? Date.now() - Date.parse(snapshot.fetchedAt) : NaN;
    // Two refresh intervals allow scheduler jitter and KV propagation, not indefinite freshness.
    const fresh = Number.isFinite(age) && age >= 0 && age <= 10 * 60_000;
    const response = valid
      ? jsonResponse(refreshEventDates(snapshot.data as EventData[]), { headers: {
          "x-content-source": fresh ? "cache" : "stale-cache",
          "x-content-fetched-at": snapshot.fetchedAt,
          ...(!fresh ? { "x-content-fallback-reason": "eventbrite-refresh-overdue" } : {}),
        } })
      : jsonResponse({ error: "Eventbrite content is unavailable and no cached fallback exists." }, { status: 503 });
    return request.method === "HEAD" ? new Response(null, response) : response;
  }

  if (pathname === "/api/content/instagram") {
    try {
      return await fetchFreshInstagram(env);
    } catch (error) {
      const snapshot = await readSnapshot(env, INSTAGRAM_CACHE_RESOURCE);

      if (snapshot) {
        return jsonResponse(snapshot.data, {
          headers: {
            "x-content-source": "stale-cache",
            "x-content-fetched-at": snapshot.fetchedAt,
            "x-content-fallback-reason":
              error instanceof Error ? error.message : "instagram-unreachable",
          },
        });
      }

      return jsonResponse(
        { error: "Instagram content is unavailable and no cached fallback exists." },
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
