export interface NewsletterEnv {
  BREVO_API_KEY?: string;
  BREVO_LIST_ID?: string;
  NEWSLETTER_RATE_LIMITER?: RateLimit;
  SITE_URL: string;
}

const contactsUrl = 'https://api.brevo.com/v3/contacts';
const accepted = () => Response.json({ message: 'Your signup request has been received.' }, { headers: { 'cache-control': 'no-store' } });

const failure = (status: number) => Response.json({ error: status === 503 ? 'Signup is temporarily unavailable. Please try again later.' : 'Unable to accept this signup request.' }, {
  status, headers: { 'cache-control': 'no-store', ...(status === 405 ? { allow: 'POST' } : {}) },
});

function validEmail(email: unknown): email is string {
  if (typeof email !== 'string' || email.length > 254) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && local.length <= 64 &&
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(local) &&
    domain.includes('.') && domain.split('.').every(label =>
      label.length <= 63 && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label));
}

async function readSignup(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const bytes = new Uint8Array(4096);
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.byteLength > bytes.length) {
        await reader.cancel();
        throw new RangeError('body');
      }
      bytes.set(value, size);
      size += value.byteLength;
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, size)));
  } finally {
    reader.releaseLock();
  }
}

interface Contact {
  id: number;
  email: string;
  emailBlacklisted: boolean;
  listIds: number[];
  listUnsubscribed?: number[];
}

const isId = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const isIds = (value: unknown): value is number[] => Array.isArray(value) && value.every(isId);

async function readContact(email: string, options: RequestInit): Promise<Contact | null> {
  const response = await fetch(`${contactsUrl}/${encodeURIComponent(email)}?identifierType=email_id`, { ...options, method: 'GET' });
  if (response.status !== 200) return null;
  const data = await response.json() as Partial<Contact> | null;
  if (!data || !isId(data.id) || typeof data.email !== 'string' || data.email.toLowerCase() !== email.toLowerCase() ||
    typeof data.emailBlacklisted !== 'boolean' || !isIds(data.listIds) ||
    (data.listUnsubscribed !== undefined && !isIds(data.listUnsubscribed))) return null;
  return data as Contact;
}

const noListWrite = (contact: Contact, listId: number) =>
  contact.emailBlacklisted || contact.listUnsubscribed?.includes(listId) || contact.listIds.includes(listId);

function listAdded(data: unknown, contact: Contact): boolean {
  if (!data || typeof data !== 'object') return false;
  const body = data as { contacts?: { success?: unknown; failure?: unknown }; success?: unknown; failure?: unknown };
  // Brevo documents nested fields in its schema and top-level fields in examples.
  const success = body.contacts?.success ?? body.success;
  const failures = [body.contacts?.failure, body.failure];
  return failures.every(value => value === undefined || (Array.isArray(value) && value.length === 0)) &&
    Array.isArray(success) && success.some(value => value === contact.id ||
      (typeof value === 'string' && value.toLowerCase() === contact.email.toLowerCase()));
}

async function subscribe(email: string, listId: number, apiKey: string): Promise<Response> {
  const options = {
    // workerd supports manual, not error; exact status checks reject redirects.
    signal: AbortSignal.timeout(8000), redirect: 'manual' as const,
    headers: { 'content-type': 'application/json', 'api-key': apiKey },
  };
  const created = await fetch(contactsUrl, {
    ...options, method: 'POST',
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: false, forceMerge: false }),
  });
  if (created.status === 201) return accepted();
  if (created.status !== 400 || (await created.json() as { code?: string })?.code !== 'duplicate_parameter') return failure(503);
  const contact = await readContact(email, options);
  if (!contact) return failure(503);
  if (noListWrite(contact, listId)) return accepted();
  // IDs avoid targeting a replacement contact if the email changes between calls.
  // The list-only endpoint never clears a concurrent global email blacklist.
  const added = await fetch(`${contactsUrl}/lists/${listId}/contacts/add`, {
    ...options, method: 'POST', body: JSON.stringify({ ids: [contact.id] }),
  });
  if (added.status === 400 && (await added.json() as { code?: string })?.code === 'duplicate_parameter') {
    const current = await readContact(email, options);
    return current?.id === contact.id && noListWrite(current, listId) ? accepted() : failure(503);
  }
  if (added.status !== 201) return failure(503);
  return listAdded(await added.json(), contact) ? accepted() : failure(503);
}

export async function handleNewsletterSignup(request: Request, env: NewsletterEnv): Promise<Response> {
  if (request.method !== 'POST') return failure(405);
  const listId = Number(env.BREVO_LIST_ID);
  let site: URL;
  try { site = new URL(env.SITE_URL); } catch { return failure(503); }
  if (!['http:', 'https:'].includes(site.protocol) || site.username || site.password ||
    !env.BREVO_API_KEY?.trim() || !/^[1-9]\d*$/.test(env.BREVO_LIST_ID ?? '') ||
    !Number.isSafeInteger(listId) || typeof env.NEWSLETTER_RATE_LIMITER?.limit !== 'function') return failure(503);
  if (request.headers.get('origin') !== site.origin || new URL(request.url).origin !== site.origin) return failure(403);
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return failure(415);
  if (Number(request.headers.get('content-length')) > 4096) return failure(413);
  try {
    const result = await env.NEWSLETTER_RATE_LIMITER.limit({ key: `newsletter:${request.headers.get('cf-connecting-ip') || 'unknown'}` });
    if (result?.success === false) return failure(429);
    if (result?.success !== true) return failure(503);
  } catch { return failure(503); }
  let data: unknown;
  try { data = await readSignup(request); } catch (error) { return failure(error instanceof RangeError ? 413 : 400); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return failure(400);
  const signup = data as Record<string, unknown>;
  if (!validEmail(signup.email) || signup.consent !== true || signup.website !== '') return failure(400);
  try {
    return await subscribe(signup.email, listId, env.BREVO_API_KEY!);
  } catch { return failure(503); }
}
