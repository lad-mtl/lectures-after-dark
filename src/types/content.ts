export interface SpeakerData {
  id: string;
  name: string;
  topic?: string | null;
  bio?: string | null;
  image?: string | null;
  imageCredit?: string | null;
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

export interface PublicEvent extends EventData {
  description?: string | null;
  topic?: string | null;
  speakerIds?: string[];
  speakerNames?: string[];
  recordingUrl?: string | null;
  resourcesUrl?: string | null;
  gallery?: string[];
  archiveTopics?: string[];
  archiveCategories?: string[];
}

export interface TopicData { id?: string | number; title: string; category?: string | null; sourceUrl?: string | null; }
