import type {
    AdminView,
    CampaignListData,
    DashboardData,
    Metrics,
    SettingValue,
} from './types';
import { EMPTY_METRICS, EMPTY_SETTINGS } from './types';

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    const responseText = await response.text();
    let result: (T & { error?: string; fields?: Record<string, string> }) | null = null;
    if (responseText) {
        try {
            result = JSON.parse(responseText) as T & { error?: string; fields?: Record<string, string> };
        } catch {
            if (!response.ok) throw new Error(`Request failed with status ${response.status}.`);
        }
    }
    if (!response.ok) {
        const fieldError = result?.fields ? Object.entries(result.fields)[0] : undefined;
        const detail = fieldError ? `${fieldError[0]} ${fieldError[1]}` : '';
        throw new Error(detail || result?.error || 'The newsletter request failed.');
    }
    if (!result) throw new Error('The newsletter service returned an empty response.');
    return result;
}

function toNumber(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toMetrics(metrics: Partial<Metrics> | undefined): Metrics {
    return {
        subscribers: toNumber(metrics?.subscribers),
        totalCampaigns: toNumber(metrics?.totalCampaigns),
        scheduledCampaigns: toNumber(metrics?.scheduledCampaigns),
        sentCampaigns: toNumber(metrics?.sentCampaigns),
        newsletterDelivered: toNumber(metrics?.newsletterDelivered),
        feedbackScheduled: toNumber(metrics?.feedbackScheduled),
        feedbackRecipients: toNumber(metrics?.feedbackRecipients),
        feedbackSent: toNumber(metrics?.feedbackSent),
        activeContacts: toNumber(metrics?.activeContacts),
    };
}

function fallbackMetrics(data: CampaignListData): Metrics {
    const totalCampaigns = data.campaigns.length;
    const scheduledCampaigns = data.campaigns.filter((campaign) => campaign.status === 'scheduled').length;
    const sentCampaigns = data.campaigns.filter((campaign) => campaign.status === 'sent').length;
    return {
        ...EMPTY_METRICS,
        subscribers: data.subscriberCount,
        totalCampaigns,
        scheduledCampaigns,
        sentCampaigns,
    };
}

/**
 * Load the admin dashboard. Tries the full `GET /api/newsletter/admin/dashboard`
 * endpoint first; when that is unavailable (older Worker build), it degrades to
 * the legacy campaigns feed so the studio keeps working.
 */
export async function fetchAdminData(): Promise<AdminView> {
    try {
        const data = await apiRequest<DashboardData>('/api/newsletter/admin/dashboard');
        return {
            adminEmail: data.adminEmail,
            hasDashboard: true,
            metrics: toMetrics(data.metrics),
            campaigns: data.campaigns ?? [],
            feedbackCampaigns: data.feedbackCampaigns ?? [],
            contacts: data.contacts ?? [],
            settings: data.settings ?? EMPTY_SETTINGS,
            integrations: data.integrations ?? {},
        };
    } catch {
        const data = await apiRequest<CampaignListData>('/api/newsletter/admin/campaigns');
        return {
            adminEmail: data.adminEmail,
            hasDashboard: false,
            metrics: fallbackMetrics(data),
            campaigns: data.campaigns ?? [],
            feedbackCampaigns: data.feedbackCampaigns ?? [],
            contacts: [],
            settings: EMPTY_SETTINGS,
            integrations: {},
        };
    }
}

export interface CampaignPayload {
    name: string;
    subject: string;
    previewText: string;
    bodyHtml: string;
}

export function createCampaign(body: CampaignPayload) {
    return apiRequest<{ success: boolean; id: string }>('/api/newsletter/admin/campaigns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export function updateCampaign(id: string, body: CampaignPayload) {
    return apiRequest<{ success: boolean }>(`/api/newsletter/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export function deleteCampaign(id: string) {
    return apiRequest<{ success: boolean }>(`/api/newsletter/admin/campaigns/${id}`, {
        method: 'DELETE',
    });
}

export function scheduleCampaign(id: string, scheduledAt: string) {
    return apiRequest<{ success: boolean }>(`/api/newsletter/admin/campaigns/${id}/schedule`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scheduledAt }),
    });
}

export function cancelCampaign(id: string) {
    return apiRequest<{ success: boolean }>(`/api/newsletter/admin/campaigns/${id}/cancel`, {
        method: 'POST',
    });
}

export function sendTestCampaign(id: string, email: string) {
    return apiRequest<{ success: boolean }>(`/api/newsletter/admin/campaigns/${id}/test`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
    });
}

export function uploadAsset(file: File) {
    const data = new FormData();
    data.set('asset', file);
    return apiRequest<{ url: string }>('/api/newsletter/admin/assets', {
        method: 'POST',
        body: data,
    });
}

export function createFeedbackCampaign(eventId: string) {
    return apiRequest<{ success: boolean }>('/api/newsletter/admin/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eventId }),
    });
}

export function cancelFeedbackCampaign(id: string) {
    return apiRequest<{ success: boolean }>(`/api/newsletter/admin/feedback/${id}/cancel`, {
        method: 'POST',
    });
}

export function archiveContact(id: string) {
    return apiRequest<{ success: boolean }>(`/api/newsletter/admin/contacts/${id}/archive`, {
        method: 'POST',
    });
}

export function saveSettings(settings: Record<string, SettingValue>) {
    return apiRequest<{ success: boolean }>('/api/newsletter/admin/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ settings }),
    });
}
