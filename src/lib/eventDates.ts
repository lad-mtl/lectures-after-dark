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
