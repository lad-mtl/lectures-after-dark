import type { ContentEnv, EventData } from './content.ts';

type Document = Record<string, unknown>;
type Kind = 'speakers' | 'team-members' | 'topics' | 'events';
const categories = new Set(['mind-behaviour', 'health-body', 'science-technology', 'history-culture', 'society-power', 'work-leadership']);
const text = (value: unknown): string | null => typeof value === 'string' ? value : null;
function media(value: unknown, base: string): string | null {
  const raw = typeof value === 'string' ? value : value && typeof value === 'object' ? text((value as Document).url) : null;
  if (!raw) return null;
  try { const url = new URL(raw, base); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [];
}
function normalize(value: unknown, kind: Kind, base: string): Document {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid document');
  const doc = value as Document;
  if (typeof doc.id !== 'string' && typeof doc.id !== 'number') throw new Error('Invalid document ID');
  const result: Document = { id: String(doc.id) };
  if (kind === 'events') {
    result.eventbriteUrl = text(doc.eventbriteUrl);
    for (const key of ['description', 'topic', 'recordingUrl', 'resourcesUrl']) result[key] = text(doc[key]);
    result.speakerIds = strings(doc.speakerIds);
    result.speakerNames = strings(doc.speakerNames);
    result.gallery = Array.isArray(doc.gallery) ? doc.gallery.map(x => media(x, base)).filter(Boolean) : [];
    return result;
  }
  const label = kind === 'topics' ? 'title' : 'name';
  if (typeof doc[label] !== 'string') throw new Error('Invalid document label');
  result[label] = doc[label];
  const fields = kind === 'topics' ? ['description', 'sourceUrl'] : kind === 'speakers' ? ['topic', 'bio', 'imageCredit', 'twitter', 'linkedin', 'website'] : ['title', 'description', 'imageCredit', 'linkUrl', 'linkText'];
  for (const key of fields) result[key] = text(doc[key]);
  if (kind === 'topics') result.category = categories.has(String(doc.category)) ? doc.category : null;
  else { result.image = media(doc.image, base); result.order = typeof doc.order === 'number' ? doc.order : 0; }
  return result;
}

async function fetchDocuments(env: ContentEnv, kind: Kind): Promise<Document[]> {
  const configured = Number(env.PAYLOAD_TIMEOUT_MS ?? 3000);
  const timeout = Number.isSafeInteger(configured) && configured > 0 && configured <= 2147483647 ? configured : 3000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const base = env.PAYLOAD_CONTENT_API_URL.replace(/\/+$/, '');
    const docs: Document[] = [];
    for (let page = 1; page <= 100; page++) {
      const url = new URL(`${base}/${kind}`);
      url.search = new URLSearchParams({ page: String(page), limit: '100', depth: '1', ...(kind === 'speakers' || kind === 'team-members' ? { sort: 'order' } : {}) }).toString();
      const request = new Request(url, { headers: { accept: 'application/json' }, redirect: 'manual', signal: controller.signal });
      const response = env.PAYLOAD_CMS && url.hostname === 'cms.lecturesafterdark.ca' ? await env.PAYLOAD_CMS.fetch(request) : await fetch(request);
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Payload unavailable');
      const body = await response.json() as { docs?: unknown; hasNextPage?: unknown; nextPage?: unknown };
      if (!body || !Array.isArray(body.docs) || typeof body.hasNextPage !== 'boolean') throw new Error('Invalid response');
      docs.push(...body.docs.map(doc => normalize(doc, kind, base)));
      if (!body.hasNextPage) return [...new Map(docs.map(doc => [doc.id, doc])).values()];
      if (body.nextPage !== page + 1) throw new Error('Invalid pagination');
    }
    throw new Error('Pagination limit');
  } finally { clearTimeout(timer); }
}
export async function payloadCollection(env: ContentEnv, kind: Kind): Promise<Response> {
  const key = `content:${kind === 'events' ? 'event-enrichment' : kind}`;
  try {
    const data = await fetchDocuments(env, kind);
    if (kind === 'speakers' || kind === 'team-members') data.sort((a, b) => Number(a.order) - Number(b.order));
    const fetchedAt = new Date().toISOString();
    try { await env.CONTENT_CACHE?.put(key, JSON.stringify({ data, fetchedAt })); } catch { /* Cache failure does not discard fresh content. */ }
    return Response.json(data, { headers: { 'x-content-source': 'live', 'x-content-fetched-at': fetchedAt } });
  } catch {
    try {
      const snapshot = await env.CONTENT_CACHE?.get(key, 'json') as { data?: unknown; fetchedAt?: unknown } | null;
      if (snapshot && Array.isArray(snapshot.data) && typeof snapshot.fetchedAt === 'string') return Response.json(snapshot.data, { headers: { 'x-content-source': 'stale-cache', 'x-content-fetched-at': snapshot.fetchedAt } });
    } catch { /* No upstream or cache details in public errors. */ }
    return Response.json({ error: 'Content is temporarily unavailable.' }, { status: 503 });
  }
}
export async function enrichEvents(events: EventData[], env: ContentEnv): Promise<EventData[]> {
  // Production has this private binding. Never turn CMS records into a second event source.
  if (!env.PAYLOAD_CMS) return events;
  const response = await payloadCollection(env, 'events');
  if (!response.ok) return events;
  const docs = await response.json() as Document[];
  const byUrl = new Map(docs.map(doc => [doc.eventbriteUrl, doc]));
  return events.map(event => {
    const doc = byUrl.get(event.eventbriteUrl);
    if (!doc) return event;
    const editorial = { ...doc };
    delete editorial.id;
    delete editorial.eventbriteUrl;
    return { ...editorial, ...event };
  });
}
