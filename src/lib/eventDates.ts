import type { EventData } from "../types/content";
// Persisted flags age out. Reclassify whenever events cross a fetch boundary.
// Omit unknown dates rather than advertising an event as upcoming or past.
export function refreshEventDates<T extends { startsAt: string; isPast: boolean }>(
  events: T[],
  now = Date.now(),
): T[] {
  return events.flatMap((event) => {
    const startsAt = typeof event?.startsAt === "string" ? Date.parse(event.startsAt) : NaN;
    return Number.isFinite(startsAt) ? [{ ...event, isPast: startsAt <= now }] : [];
  });
}

export function eventDate(event: EventData) {
  if (!Number.isFinite(Date.parse(event.startsAt))) return "";
  return new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Toronto",
  }).format(new Date(event.startsAt));
}

export function eventYear(event: Pick<EventData, "startsAt">) {
  if (!Number.isFinite(Date.parse(event.startsAt))) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", timeZone: "America/Toronto",
  }).format(new Date(event.startsAt));
}
