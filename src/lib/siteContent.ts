import type { SpeakerData, PublicEvent } from "../types/content";
import { eventYear } from "./eventDates.ts";
export function safeUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}
// Event destinations must be absolute HTTPS links on Eventbrite, never arbitrary URLs.
export function eventbriteUrl(value?: string | null): string | undefined {
  if (!value || value !== value.trim()) return undefined;
  try {
    const url = new URL(value);
    const allowedHost = /^(?:www\.)?eventbrite\.(?:com|ca|co\.uk|com\.au|ie|de|fr|es|it|nl|be|sg|co\.nz|com\.br|com\.mx|com\.ar|cl|com\.co|com\.pe|com\.hk)$/.test(url.hostname);
    return url.protocol === "https:" && allowedHost && !url.username && !url.password && !url.port ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function eventSpeakers(event: PublicEvent, speakers: SpeakerData[]) {
  return speakers.filter(
    (speaker) =>
      event.speakerIds?.includes(speaker.id) ||
      event.speakerNames?.includes(speaker.name),
  );
}
export interface ArchiveTopic {
  title: string;
  sourceUrl?: string | null;
  category?: string | null;
}

// Normalize typography, not meaning: no substring or fuzzy title associations.
function titleKey(value?: string | null) {
  return (value || "").normalize("NFKC").replace(/[‘’ʼ]/g, "'").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}
function sourceKey(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.href;
  } catch { return ""; }
}

export function archiveEvents(events: PublicEvent[], speakers: SpeakerData[], topics: ArchiveTopic[]): PublicEvent[] {
  const result = events.map(event => ({ ...event, speakerNames: [...(event.speakerNames || [])], archiveTopics: [] as string[], archiveCategories: [] as string[] }));
  const eventSources = new Map<string, number[]>();
  const titleEvents = new Map<string, Set<number>>();
  const addTitle = (title: string | null | undefined, index: number) => {
    const key = titleKey(title);
    if (key) titleEvents.set(key, (titleEvents.get(key) || new Set()).add(index));
  };
  result.forEach((event, i) => {
    const key = sourceKey(event.eventbriteUrl);
    if (key) eventSources.set(key, [...(eventSources.get(key) || []), i]);
    addTitle(event.title, i);
    addTitle(event.topic, i);
  });
  topics.forEach(topic => {
    const key = sourceKey(topic.sourceUrl);
    const matches = key ? eventSources.get(key) : undefined;
    if (matches?.length !== 1) return;
    const i = matches[0];
    if (typeof topic.title === "string" && topic.title.trim()) {
      result[i].archiveTopics.push(topic.title);
      addTitle(topic.title, i);
    }
    if (typeof topic.category === "string" && topic.category) result[i].archiveCategories.push(topic.category);
  });
  speakers.forEach(speaker => {
    if (typeof speaker.name !== "string") return;
    result.forEach(event => {
      if (event.speakerIds?.includes(speaker.id) || event.speakerNames.includes(speaker.name)) event.speakerNames.push(speaker.name);
    });
    const matches = titleEvents.get(titleKey(speaker.topic));
    if (matches?.size === 1) result[[...matches][0]].speakerNames.push(speaker.name);
  });
  return result.map(event => ({ ...event, speakerNames: [...new Set(event.speakerNames)] }));
}
export function filterEvents(
  events: PublicEvent[],
  filters: {
    upcoming: boolean;
    search: string;
    topic: string;
    year: string;
    category?: string;
    oldest?: boolean;
  },
) {
  return events
    .filter(
      (event) =>
        event.isPast !== filters.upcoming &&
        (!filters.topic || event.topic === filters.topic || event.title === filters.topic || event.archiveTopics?.includes(filters.topic)) &&
        (!filters.category || event.archiveCategories?.includes(filters.category)) &&
        (!filters.year ||
          eventYear(event) === filters.year) &&
        [
          event.title,
          event.topic,
          event.locationLabel,
          ...(event.speakerNames || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(filters.search.toLowerCase().trim()),
    )
    .sort(
      (a, b) =>
        (Date.parse(a.startsAt) - Date.parse(b.startsAt)) *
        (filters.upcoming || filters.oldest ? 1 : -1),
    );
}
