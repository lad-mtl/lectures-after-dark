import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleContentRequest } from '../worker/content.ts';

const request = () => new Request('https://site.test/api/content/events');
const env = { STRAPI_CONTENT_API_URL: 'https://cms.test', EVENTBRITE_PRIVATE_TOKEN: 'test-only-token', EVENTBRITE_ORGANIZER_ID: 'organizer-only' };

test('explicit organization ID bypasses discovery, paginates, writes fresh array and classifies dates', async (t) => {
  const now = Date.parse('2026-10-26T12:00:00Z');
  t.mock.method(Date, 'now', () => now);
  const event = (id, startsAt, extra = {}) => ({ id, name: { text: id }, start: { utc: startsAt }, url: `https://eventbrite.test/${id}`, status: 'live', ...extra });
  const urls = [];
  const writes = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(new URL(url));
    return Response.json(urls.length === 1 ? {
      events: [event('future', '2026-11-01T00:00:00Z'), event('invalid', 'invalid'), event('private', '2026-11-02T00:00:00Z', { listed: false })],
      pagination: { has_more_items: true, continuation: 'next-page' },
    } : { events: [event('past', '2026-10-13T22:30:00Z'), event('boundary', new Date(now).toISOString()), event('draft', '2026-11-02T00:00:00Z', { status: 'draft' })] });
  });
  const response = await handleContentRequest(request(), {
    ...env, EVENTBRITE_ORGANIZATION_ID: 'website-org',
    CONTENT_CACHE: { put: async (...args) => writes.push(args) },
  });
  assert.equal(response.headers.get('x-content-source'), 'live');
  assert.equal(urls.length, 2);
  assert.ok(urls.every(url => url.pathname === '/v3/organizations/website-org/events/'));
  assert.equal(urls[1].searchParams.get('continuation'), 'next-page');
  const data = await response.json();
  assert.deepEqual(data.map(e => [e.id, e.isPast]), [['future', false], ['boundary', true], ['past', true]]);
  assert.equal(writes[0][0], 'content:events');
  const snapshot = JSON.parse(writes[0][1]);
  assert.deepEqual(snapshot.data, data);
  assert.equal(snapshot.fetchedAt, response.headers.get('x-content-fetched-at'));
});

for (const status of [401, 404, 429, 500]) {
  test(`HTTP ${status} without cache returns 503 and a safe diagnostic`, async (t) => {
    const logs = [];
    t.mock.method(console, 'warn', (...args) => logs.push(args));
    t.mock.method(globalThis, 'fetch', async () => new Response('sensitive upstream body', { status }));
    const response = await handleContentRequest(request(), env);
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /unavailable/);
    assert.deepEqual(logs[0][1], { reason: `eventbrite-http-${status}`, source: 'unavailable' });
  });
}

test('abort returns stale fallback with safe timeout diagnostic', async (t) => {
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async () => { throw new DOMException('sensitive URL', 'AbortError'); });
  const response = await handleContentRequest(request(), {
    ...env, CONTENT_CACHE: { get: async () => ({ data: [], fetchedAt: '2026-10-07T00:00:00Z' }) },
  });
  assert.equal(response.headers.get('x-content-fallback-reason'), 'eventbrite-timeout');
});

test('missing token returns 503 without making an upstream request', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not fetch'); });
  assert.equal((await handleContentRequest(request(), { ...env, EVENTBRITE_PRIVATE_TOKEN: '' })).status, 503);
  assert.equal(fetch.mock.callCount(), 0);
});

test('fallback diagnostics log a safe reason without upstream error text', async (t) => {
  const logs = [];
  t.mock.method(console, 'warn', (...args) => logs.push(args));
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('private-token-in-url secret-host.test'); });
  const response = await handleContentRequest(request(), {
    ...env, CONTENT_CACHE: { get: async () => ({ data: [], fetchedAt: '2026-10-07T00:00:00Z' }) },
  });
  assert.equal(response.headers.get('x-content-fallback-reason'), 'eventbrite-unreachable');
  assert.equal(logs.length, 1);
  assert.equal(logs[0][1].source, 'stale-cache');
  assert.equal(logs[0][1].reason, 'eventbrite-unreachable');
  assert.doesNotMatch(JSON.stringify(logs), /private-token|secret-host/);
});

test('stale cached events are reclassified at read time and invalid dates omitted', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const now = Date.parse('2026-10-26T12:00:00Z');
  t.mock.method(Date, 'now', () => now);
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 404 }));
  const data = [
    { id: 'past', startsAt: '2026-10-13T22:30:00Z', isPast: false },
    { id: 'future', startsAt: '2026-11-13T22:30:00Z', isPast: true },
    { id: 'boundary', startsAt: new Date(now).toISOString(), isPast: false },
    { id: 'invalid', startsAt: 'not-a-date', isPast: false },
  ];
  const response = await handleContentRequest(request(), {
    ...env, CONTENT_CACHE: { get: async () => ({ data, fetchedAt: '2026-10-07T21:50:37.650Z' }) },
  });
  assert.equal(response.headers.get('x-content-source'), 'stale-cache');
  assert.equal(response.headers.get('x-content-fetched-at'), '2026-10-07T21:50:37.650Z');
  assert.deepEqual((await response.json()).map(e => [e.id, e.isPast]), [['past', true], ['future', false], ['boundary', true]]);
  assert.equal(data[0].isPast, false, 'must not mutate stored snapshot');
});

test('missing preferred name never falls back to a different single organization', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const urls = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(String(url));
    return Response.json({ organizations: [{ id: 'wrong', name: 'Lectures After Dark Other' }], events: [] });
  });
  const response = await handleContentRequest(request(), env);
  assert.equal(response.status, 503);
  assert.equal(urls.length, 1);
});

test('website discovers the exact organization instead of using newsletter organizer ID', async (t) => {
  const urls = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(new URL(url));
    return Response.json(String(url).includes('/users/me/organizations/')
      ? { organizations: [{ id: 'wrong', name: 'Other' }, { id: 'correct', name: 'Lectures After Dark' }] }
      : { events: [] });
  });
  const response = await handleContentRequest(request(), env);
  assert.equal(response.status, 200);
  assert.deepEqual(urls.map(url => url.pathname), ['/v3/users/me/organizations/', '/v3/organizations/correct/events/']);
  assert.deepEqual(await response.json(), []);
});
