import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as content from '../src/hooks/useContent.ts';

test('frontend rejects malformed response bodies rather than advertising an empty schedule', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'bad body' }));
  await assert.rejects(content.fetchEvents());
});

test('frontend rejects HTTP failure instead of returning a successful empty list', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  await assert.rejects(content.fetchEvents(), /temporarily unavailable/);
});

test('frontend rejects network failure', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Network failed'); });
  await assert.rejects(content.fetchEvents());
});

test('live empty events have no stale warning', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([], { headers: { 'x-content-source': 'live' } }));
  assert.deepEqual(await content.fetchEvents(), { events: [], stale: false, fetchedAt: null });
});

test('frontend fetch reclassifies dates and preserves stale response metadata', async (t) => {
  t.mock.method(Date, 'now', () => Date.parse('2026-10-26T12:00:00Z'));
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/api/content/events');
    return Response.json([
      { id: 'past', startsAt: '2026-10-13T22:30:00Z', isPast: false },
      { id: 'future', startsAt: '2026-11-13T22:30:00Z', isPast: true },
      { id: 'invalid', startsAt: '', isPast: false },
    ], { headers: { 'x-content-source': 'stale-cache', 'x-content-fetched-at': '2026-10-07T00:00:00Z' } });
  });
  assert.equal(typeof content.fetchEvents, 'function', 'events fetch needs metadata and current date classification');
  const result = await content.fetchEvents();
  assert.deepEqual(result.events.map(e => [e.id, e.isPast]), [['past', true], ['future', false]]);
  assert.equal(result.stale, true);
  assert.equal(result.fetchedAt, '2026-10-07T00:00:00Z');
});
