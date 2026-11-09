import { validateParticipation as validateFields, type ParticipationKind } from './participation-fields.ts';
import { handleContentRequest, type ContentEnv, type EventData } from './content.ts';
import { notionSubmission } from './participation-notion.ts';

export interface ParticipationEnv extends ContentEnv {
  NOTION_API_KEY?: string;
  PARTICIPATION_RATE_LIMITER?: RateLimit;
  SITE_URL?: string;
}

const MAX_BYTES = 12_000;
const kinds = new Set(['speaker', 'venue', 'topic', 'feedback', 'volunteer']);

export function validateParticipation(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const fields = Object.entries(input);
  if (fields.length > 30 || fields.some(([key, value]) => key.length > 80 || typeof value !== 'string' || value.length > 5000)) return null;
  const data = Object.fromEntries(fields.map(([key, value]) => [key, (value as string).trim()]));
  if (!kinds.has(data.kind) || (data.name?.length ?? 0) > 160 || (data.email?.length ?? 0) > 254) return null;
  if (Object.keys(validateFields(data.kind as ParticipationKind, data)).length) return null;
  return data;
}

export async function handleParticipation(request: Request, env: ParticipationEnv): Promise<Response> {
  const reply = (error: string, status: number) => Response.json({ error }, { status, headers: { 'cache-control': 'no-store' } });
  if (request.method !== 'POST') return reply('Method not allowed.', 405);
  let origin: string;
  try { origin = new URL(env.SITE_URL || '').origin; } catch { return reply('Submissions are temporarily unavailable.', 503); }
  const allowed = new Set([origin]);
  if (!allowed.has(request.headers.get('origin') ?? '')) return reply('This origin is not allowed.', 403);
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return reply('Use application/json.', 415);
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return reply('Submission is too large.', 413);
  if (!env.NOTION_API_KEY || !env.PARTICIPATION_RATE_LIMITER) return reply('Submissions are temporarily unavailable.', 503);
  let limit: { success: boolean };
  try { limit = await env.PARTICIPATION_RATE_LIMITER.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown-client' }); } catch { return reply('Submissions are temporarily unavailable.', 503); }
  if (!limit.success) return reply('Please wait a minute before trying again.', 429);
  // Bound the stream even when Content-Length is absent or incorrect.
  const reader = request.body?.getReader();
  if (!reader) return reply('A submission is required.', 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); return reply('Submission is too large.', 413); }
      chunks.push(value);
    }
  } catch { return reply('Unable to read submission.', 400); }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { return reply('Invalid JSON.', 400); }
  const data = validateParticipation(parsed);
  if (!data) return reply('Please check your name, email and required fields.', 400);
  if (data.companyFax) return reply('Submission could not be accepted.', 400);
  let eventName: string | undefined;
  if (data.kind === 'feedback') {
    try {
      const response = await handleContentRequest(new Request(new URL('/api/content/events', request.url)), env);
      // Stale snapshots are useful for browsing, not for validating a new write.
      if (!response?.ok || response.headers.get('x-content-source') !== 'live') return reply('Events are temporarily unavailable. Your feedback was not saved.', 503);
      const events = await response.json() as EventData[];
      const event = events.find(item => item.id === data.eventId);
      if (!event || !event.title?.trim() || !Number.isFinite(Date.parse(event.startsAt)) || Date.parse(event.startsAt) >= Date.now()) return reply('Choose an available past event.', 400);
      eventName = event.title;
    } catch { return reply('Events are temporarily unavailable. Your feedback was not saved.', 503); }
  }
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(8000),
      headers: { 'Content-Type': 'application/json', 'Notion-Version': '2025-09-03', Authorization: `Bearer ${env.NOTION_API_KEY}` },
      body: JSON.stringify(notionSubmission(data, eventName)),
    });
    // Never retry a create automatically: a server error can follow a committed write.
    if (response.status >= 500) return reply('Could not confirm your submission. Please contact the team before retrying.', 502);
    if (!response.ok) return reply('Your submission was not saved. Please try again later.', 502);
    const result = await response.json() as { object?: string; id?: string };
    if (result.object !== 'page' || !result.id || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(result.id)) return reply('Could not confirm your submission. Please contact the team before retrying.', 502);
    return Response.json({ saved: true, reference: result.id, message: 'Saved in Notion for review.' }, { status: 201, headers: { 'cache-control': 'no-store' } });
  } catch { return reply('Could not confirm your submission. Please contact the team before retrying.', 503); }
}
