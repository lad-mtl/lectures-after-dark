import { useEffect, useState } from "react";
import { refreshEventDates } from "../lib/eventDates.ts";

const CONTENT_API_BASE = "/api/content";

export interface SpeakerData {
  id: string;
  name: string;
  topic?: string | null;
  bio?: string | null;
  image?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  website?: string | null;
  order?: number | null;
}

export interface VenueData {
  id: string;
  name: string;
  neighborhood: string;
  description?: string | null;
  imageUrl?: string | null;
  mapsLink?: string | null;
  order?: number | null;
}

export interface PageCtaContent {
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaButtonText?: string | null;
  ctaButtonLink?: string | null;
}

export interface FaqItem {
  question: string;
  answer?: string | null;
}

export interface FaqData {
  items?: (FaqItem | null)[] | null;
}

export interface EventData {
  id: string;
  title: string;
  startsAt: string;
  day: string;
  month: string;
  timeLabel: string;
  locationLabel: string;
  priceLabel: string;
  imageUrl: string | null;
  eventbriteUrl: string;
  isPast: boolean;
}

export interface TeamMemberData {
  id: string;
  name: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  order?: number | null;
}

export interface InstagramPostData {
  id: string;
  caption?: string | null;
  imageUrl: string;
  mediaType?: string | null;
  permalink: string;
  timestamp?: string | null;
}

async function fetchContent<T>(resource: string): Promise<T> {
  const response = await fetch(`${CONTENT_API_BASE}/${resource}`);

  if (!response.ok) {
    throw new Error(`Content request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function useSpeakers() {
  const [speakers, setSpeakers] = useState<SpeakerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<SpeakerData[]>("speakers")
      .then((data) => {
        setSpeakers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { speakers, loading };
}

export function useVenues() {
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<VenueData[]>("venues")
      .then((data) => {
        setVenues(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { venues, loading };
}

export function useSpeakerPageContent() {
  const [pageContent, setPageContent] = useState<PageCtaContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<PageCtaContent>("speaker-page")
      .then((data) => {
        setPageContent(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { pageContent, loading };
}

export function useVenuePageContent() {
  const [pageContent, setPageContent] = useState<PageCtaContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<PageCtaContent>("venue-page")
      .then((data) => {
        setPageContent(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { pageContent, loading };
}

export function useFaq() {
  const [faq, setFaq] = useState<FaqData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<FaqData>("faq")
      .then((data) => {
        setFaq(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { faq, loading };
}

export async function fetchEvents() {
  const response = await fetch(`${CONTENT_API_BASE}/events`);
  if (!response.ok) throw new Error("Events are temporarily unavailable.");
  const data = await response.json() as EventData[];
  return {
    events: refreshEventDates(data),
    stale: response.headers.get("x-content-source") === "stale-cache",
    fetchedAt: response.headers.get("x-content-fetched-at"),
  };
}

export function useEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchEvents()
      .then((data) => {
        if (!active) return;
        setEvents(data.events);
        setStale(data.stale);
        setFetchedAt(data.fetchedAt);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { events, loading, stale, fetchedAt, error };
}

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<TeamMemberData[]>("team-members")
      .then((data) => {
        setTeamMembers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { teamMembers, loading };
}

export function useInstagramPosts() {
  const [posts, setPosts] = useState<InstagramPostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<InstagramPostData[]>("instagram")
      .then((data) => {
        setPosts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { posts, loading };
}
