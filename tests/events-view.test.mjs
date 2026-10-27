import './tsx-loader.mjs';
import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let state;
mock.module('../src/hooks/useContent.ts', { namedExports: { useEvents: () => state } });
mock.module('../src/constants/index.ts', { namedExports: { EVENTBRITE_PROFILE_URL: 'https://www.eventbrite.com/o/test-only' } });
const { UpcomingEvents } = await import('../src/components/UpcomingEvents.tsx');

test('live empty results are distinguishable from stale or failed refreshes', () => {
  state = { events: [], loading: false, stale: false, error: false, fetchedAt: null };
  const html = renderToStaticMarkup(createElement(UpcomingEvents));
  assert.match(html, /No events listed right now/);
  assert.doesNotMatch(html, /could not refresh|temporarily unavailable/);
});

test('stale nonempty results preserve past badges and qualify upcoming availability', () => {
  state = { events: [{ id: 'past', title: 'Test past lecture', startsAt: '2026-10-13T22:30:00Z', isPast: true }], loading: false, stale: true, error: false };
  const html = renderToStaticMarkup(createElement(UpcomingEvents));
  assert.match(html, /No upcoming events in these cached listings/);
  assert.match(html, />Past</);
  assert.match(html, /Test past lecture/);
  assert.match(html, /could not refresh/i);
});

test('stale empty results show a warning and Eventbrite link, not a definitive no-events claim', () => {
  state = { events: [], loading: false, stale: true, error: false, fetchedAt: '2026-10-07T00:00:00Z' };
  const html = renderToStaticMarkup(createElement(UpcomingEvents));
  assert.match(html, /role="status"/);
  assert.match(html, /could not refresh/i);
  assert.match(html, /cached/i);
  assert.match(html, /href="https:\/\/www.eventbrite/);
  assert.doesNotMatch(html, /No events listed right now/);
});

test('fetch failure offers Eventbrite without claiming there are no events', () => {
  state = { events: [], loading: false, stale: false, error: true, fetchedAt: null };
  const html = renderToStaticMarkup(createElement(UpcomingEvents));
  assert.match(html, /temporarily unavailable/i);
  assert.match(html, /href="https:\/\/www.eventbrite/);
  assert.doesNotMatch(html, /No events listed right now/);
});
