import { useEffect, useState } from "react";

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

export function useEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent<EventData[]>("events")
      .then((data) => {
        setEvents(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { events, loading };
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
