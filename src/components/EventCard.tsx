import type { PublicEvent } from "../types/content";
import { safeUrl, eventbriteUrl } from "../lib/siteContent";
import { eventDate } from "../lib/eventDates";
export function EventImage({
  event,
  className = "",
}: {
  event: PublicEvent;
  className?: string;
}) {
  return (
    <div className={`lad-event-image ${className}`}>
      <img
        src={safeUrl(event.imageUrl) || "/idea.webp"}
        alt=""
        loading="lazy"
      />
    </div>
  );
}
export function EventCard({
  event,
  row = false,
}: {
  event: PublicEvent;
  row?: boolean;
}) {
  const destination = eventbriteUrl(event.eventbriteUrl);
  return (
    <article className={row ? "lad-event-row" : "lad-event-card"}>
      {destination ? (
        <a href={destination} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
          <EventImage event={event} />
        </a>
      ) : <EventImage event={event} />}
      <div>
        <p className="lad-eyebrow">
          {[event.topic, eventDate(event)].filter(Boolean).join(" · ")}
        </p>
        <h3>{destination ? <a href={destination} target="_blank" rel="noreferrer">{event.title}</a> : event.title}</h3>
        <p>{[event.speakerNames?.join(", "), event.locationLabel].filter(Boolean).join(" · ")}</p>
        {!row && (destination ? (
          <a className="lad-inline-link" href={destination} target="_blank" rel="noreferrer">View on Eventbrite ↗</a>
        ) : <p>Event link unavailable.</p>)}
      </div>
      {row && (destination ? (
        <a className="lad-inline-link" href={destination} target="_blank" rel="noreferrer">View on Eventbrite ↗</a>
      ) : <p>Event link unavailable.</p>)}
    </article>
  );
}
