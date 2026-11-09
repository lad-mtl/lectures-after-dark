import { useEffect } from "react";
import { eventYear } from "../lib/eventDates";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEvents } from "../hooks/useContent";
import type { SpeakerData, PublicEvent } from "../types/content";
import { useContent } from "../hooks/useContent";
import { topicCategories } from "../data/topicCategories";
import { EventbriteCTA } from "../components/EventbriteCTA";
import { ContentState } from "../components/ContentState";
import { EventCard } from "../components/EventCard";
import { PageHeader } from "../components/PageHeader";
import {
  archiveEvents,
  eventbriteUrl,
  type ArchiveTopic,
  filterEvents,
} from "../lib/siteContent";

export function Events() {
  const state = useEvents();
  const speakers = useContent<SpeakerData>("speakers");
  const topicsState = useContent<ArchiveTopic>("topics");
  const [params, setParams] = useSearchParams();
  const events: PublicEvent[] = archiveEvents(state.events, speakers.data, topicsState.data);
  const upcoming = params.get("tab") === "upcoming";
  const search = params.get("search") || "";
  const topic = params.get("topic") || "";
  const year = params.get("year") || "";
  const category = params.get("category") || "";
  const oldest = params.get("sort") === "oldest";
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  const filtered = filterEvents(events, {
    upcoming,
    search,
    topic,
    category,
    year,
    oldest,
  });
  const years = [
    ...new Set(
      events.map(eventYear),
    ),
  ]
    .sort()
    .reverse();
  return (
    <div className="lad-container">
      <PageHeader eyebrow="THE LAD ARCHIVE" title="Nights worth revisiting.">
        Explore the talks, people, and ideas we’ve brought together.
      </PageHeader>
      <div className="lad-tabs" aria-label="Event period">
        <button
          className={!upcoming ? "active" : ""}
          aria-pressed={!upcoming}
          onClick={() => update("tab", "")}
        >
          Past events
        </button>
        <button
          className={upcoming ? "active" : ""}
          aria-pressed={upcoming}
          onClick={() => update("tab", "upcoming")}
        >
          Upcoming
        </button>
      </div>
      <div className="lad-filters">
        <label className="lad-search">
          <span className="lad-sr-only">
            Search events, speakers, or topics
          </span>
          <input
            type="search"
            placeholder="Search events, speakers, or topics"
            value={search}
            onChange={(event) => update("search", event.target.value)}
          />
        </label>
        <label>
          <span className="lad-sr-only">Topic category</span>
          <select
            value={category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">Category: All</option>
            {topicCategories.map(({ value, title }) => (
              <option key={value} value={value}>{title}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="lad-sr-only">Year</span>
          <select
            value={year}
            onChange={(event) => update("year", event.target.value)}
          >
            <option value="">Year: All</option>
            {years.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      {(speakers.error || topicsState.error) && <p role="status">Some speaker or topic filters are temporarily unavailable; event titles and explicit speaker names remain searchable.</p>}
      {topic && <p>Topic: {topic} <button className="lad-text-button" onClick={() => update("topic", "")}>Clear topic</button></p>}
      <ContentState {...state} />
      {(state.stale || state.error) && <EventbriteCTA />}
      <div className="lad-result-heading">
        {!state.loading && !state.error && (!state.stale || filtered.length > 0) && <p role="status">
          {state.stale ? "Cached listings: " : ""}{filtered.length} {upcoming ? "upcoming" : "past"}{" "}
          {filtered.length === 1 ? "event" : "events"}
        </p>}
        <label>
          <span className="lad-sr-only">Sort events</span>
          <select
            value={oldest ? "oldest" : ""}
            onChange={(event) => update("sort", event.target.value)}
          >
            <option value="">
              {upcoming ? "Soonest first" : "Newest first"}
            </option>
            {!upcoming && <option value="oldest">Oldest first</option>}
          </select>
        </label>
      </div>
      <div className="lad-event-list">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} row />
        ))}
      </div>
      {!state.loading && !state.error && !state.stale && !filtered.length && (
        <div className="lad-empty">
          <h2>No matching events.</h2>
          <p>
            {search || topic || category || year
              ? "Try a different search or clear your filters."
              : `Check back for ${upcoming ? "upcoming" : "past"} events.`}
          </p>
          {(search || topic || category || year) && (
            <button
              className="lad-text-button"
              onClick={() => setParams(upcoming ? { tab: "upcoming" } : {})}
            >
              Clear filters →
            </button>
          )}
        </div>
      )}
      <p className="lad-list-end">
        {!state.loading &&
          !state.error && !state.stale &&
          `Showing all ${filtered.length} ${upcoming ? "upcoming" : "past"} events`}
      </p>
    </div>
  );
}

export function EventDetail() {
  const { id } = useParams();
  const state = useEvents();
  const event = state.events.find((item) => item.id === id);
  const destination = !state.loading && !state.error && event ? eventbriteUrl(event.eventbriteUrl) : undefined;
  useEffect(() => {
    if (destination) window.location.replace(destination);
  }, [destination]);

  return (
    <div className="lad-container lad-section">
      <Link to="/events">← All events</Link>
      {(state.loading || state.error) ? <ContentState {...state} /> : !event ? (
        <PageHeader eyebrow="THE LAD ARCHIVE" title="Event not found.">
          This event may no longer be available. Explore the archive for other nights.
        </PageHeader>
      ) : destination ? (
        <p role="status">Taking you to Eventbrite. <a href={destination}>Continue to {event.title} on Eventbrite</a>.</p>
      ) : (
        <div role="status"><h1>{event.title}</h1><p>The Eventbrite link for this event is unavailable.</p></div>
      )}
    </div>
  );
}
