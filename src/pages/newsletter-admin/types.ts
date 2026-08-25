export type SettingValue = string | number | boolean;
export type SettingSource = 'dashboard' | 'environment' | 'default';

export type SectionKey = 'overview' | 'campaigns' | 'feedback' | 'inbox' | 'settings';

export interface Campaign {
    id: string;
    eventbrite_event_id: string | null;
    name: string;
    subject: string;
    preview_text: string;
    body_html: string;
    body_text: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    scheduled_at: string | null;
    created_at: string;
    updated_at: string;
    sent_at: string | null;
}

export interface FeedbackCampaign {
    id: string;
    eventbrite_event_id: string;
    event_name: string;
    status: 'scheduled' | 'sending' | 'sent' | 'cancelled';
    scheduled_at: string;
    sent_at: string | null;
    recipient_count: number;
    sent_count: number;
}

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    inquiry_type: string;
    subject: string;
    message: string;
    delivery_status: string;
    error: string | null;
    created_at: string;
    archived_at: string | null;
}

export interface Metrics {
    subscribers: number;
    totalCampaigns: number;
    scheduledCampaigns: number;
    sentCampaigns: number;
    newsletterDelivered: number;
    feedbackScheduled: number;
    feedbackRecipients: number;
    feedbackSent: number;
    activeContacts: number;
}

export interface DashboardSettings {
    values: Record<string, SettingValue>;
    sources: Record<string, SettingSource>;
}

export interface DashboardData {
    adminEmail: string;
    metrics: Metrics;
    campaigns: Campaign[];
    feedbackCampaigns: FeedbackCampaign[];
    contacts: ContactSubmission[];
    settings: DashboardSettings;
    integrations: Record<string, boolean>;
}

export interface CampaignListData {
    adminEmail: string;
    subscriberCount: number;
    campaigns: Campaign[];
    feedbackCampaigns: FeedbackCampaign[];
}

export interface AdminView {
    adminEmail: string;
    hasDashboard: boolean;
    metrics: Metrics;
    campaigns: Campaign[];
    feedbackCampaigns: FeedbackCampaign[];
    contacts: ContactSubmission[];
    settings: DashboardSettings;
    integrations: Record<string, boolean>;
}

export const EMPTY_METRICS: Metrics = {
    subscribers: 0,
    totalCampaigns: 0,
    scheduledCampaigns: 0,
    sentCampaigns: 0,
    newsletterDelivered: 0,
    feedbackScheduled: 0,
    feedbackRecipients: 0,
    feedbackSent: 0,
    activeContacts: 0,
};

export const EMPTY_SETTINGS: DashboardSettings = { values: {}, sources: {} };
