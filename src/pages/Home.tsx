import { Link } from "react-router-dom";
import { SocialStats } from "../components/SocialStats";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { socialStats } from "../data/socialStats";
import { useEvents } from "../hooks/useContent";
import { ContentState } from "../components/ContentState";
import { EventCard } from "../components/EventCard";
import { EventbriteCTA } from "../components/EventbriteCTA";
import { EventImage } from "../components/EventCard";
import { Involvement } from "../components/Involvement";
import { filterEvents } from "../lib/siteContent";
import { eventDate } from "../lib/eventDates";

export default function Home() {
  const state = useEvents();
  const upcoming = filterEvents(state.events, {
    upcoming: true,
    search: "",
    topic: "",
    year: "",
  })[0];
  const past = filterEvents(state.events, {
    upcoming: false,
    search: "",
    topic: "",
    year: "",
  }).slice(0, 3);
  const ready = !state.loading && !state.error;
  if (!ready || (state.stale && !state.events.length)) {
    return (
      <div className="lad-container lad-section">
        <h1>What’s next at Lectures After Dark</h1>
        <ContentState {...state} stale={false} />
        <EventbriteCTA />
      </div>
    );
  }
  return (
    <>
      <div className="lad-container">
        <ContentState {...state} stale={false} />
        <section className="lad-home-hero">
          <div>
            <p className="lad-eyebrow">
              {upcoming
                ? "NEXT EVENT · MONTRÉAL"
                : "MONTRÉAL · TALKS, QUESTIONS & CONVERSATION"}
            </p>
            <h1>
              {upcoming ? (
                upcoming.title
              ) : (
                <>
                  Good ideas.
                  <br />
                  Great company.
                </>
              )}
            </h1>
            {upcoming ? (
              <p className="lad-lead">
                {eventDate(upcoming)} · {upcoming.timeLabel} ·{" "}
                {upcoming.locationLabel}
                <br />
                {upcoming.speakerNames?.length
                  ? `With ${upcoming.speakerNames.join(", ")}`
                  : ""}
                <br />
                Join us for a night of ideas and conversation.
              </p>
            ) : (
              <p className="lad-lead">
                {ready && !state.stale ? (
                  <>
                    We bring researchers and curious people together for talks in
                    bars. Explore the nights and ideas we’ve shared so far.
                  </>
                ) : (
                  "Researchers, curious people, and conversations in Montréal bars."
                )}
              </p>
            )}
            <div className="lad-actions">
              <EventbriteCTA eventUrl={upcoming?.eventbriteUrl} />
              <Link to="/events">Browse past talks →</Link>
            </div>
          </div>
          {upcoming ? (
            <EventImage event={upcoming} className="lad-hero-image" />
          ) : (
            <div className="lad-hero-image">
              <img
                src="/images/lad-home-audience.webp"
                alt="An audience listening to a talk in a warmly lit bar at Lectures After Dark"
                width={1400}
                height={933}
              />
            </div>
          )}
        </section>
        <SocialStats stats={socialStats} />
        <section className="lad-section">
          <div className="lad-section-heading">
            <h2>A look back</h2>
            <Link to="/events">All past events →</Link>
          </div>
          <div className="lad-event-grid">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {ready && !past.length && (
            <p>
              {state.stale
                ? "No past events in the saved listings."
                : "Past events will appear here."}
            </p>
          )}
        </section>
        <section className="lad-discover">
          <div>
            <h2>The people behind the ideas</h2>
            <p>Meet the speakers who have joined us.</p>
            <Link to="/speakers">Explore speakers →</Link>
          </div>
          <div>
            <h2>Follow your curiosity</h2>
            <p>Browse the topics we’ve explored together.</p>
            <Link to="/topics">Explore topics →</Link>
          </div>
        </section>
        <NewsletterSignup />
        <Involvement />
      </div>
    </>
  );
}
