import {
    CalendarClock,
    CheckCircle2,
    Clock,
    Inbox,
    Mail,
    Megaphone,
    Send,
    Users,
} from 'lucide-react';
import styles from '../NewsletterAdmin.module.css';
import type { AdminView, Campaign, FeedbackCampaign } from './types';

interface OverviewSectionProps {
    view: AdminView;
}

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    sending: 'Sending',
    sent: 'Sent',
    cancelled: 'Cancelled',
};

function statusChipClass(status: string): string {
    switch (status) {
        case 'draft': return styles.chipNeutral;
        case 'scheduled': return styles.chipPending;
        case 'sending': return styles.chipPending;
        case 'sent': return styles.chipSuccess;
        case 'cancelled': return styles.chipMuted;
        default: return styles.chipNeutral;
    }
}

function formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const CAMPAIGN_STATUS_ICONS: Record<string, typeof Megaphone> = {
    draft: Clock,
    scheduled: CalendarClock,
    sending: Send,
    sent: CheckCircle2,
    cancelled: Clock,
};

const OverviewSection = ({ view }: OverviewSectionProps) => {
    const metricCards = [
        { label: 'Subscribers', value: view.metrics.subscribers, icon: Users },
        { label: 'Total campaigns', value: view.metrics.totalCampaigns, icon: Megaphone },
        { label: 'Scheduled', value: view.metrics.scheduledCampaigns, icon: CalendarClock },
        { label: 'Sent campaigns', value: view.metrics.sentCampaigns, icon: Send },
        { label: 'Newsletter delivered', value: view.metrics.newsletterDelivered, icon: Mail },
        { label: 'Feedback scheduled', value: view.metrics.feedbackScheduled, icon: Clock },
        { label: 'Feedback recipients', value: view.metrics.feedbackRecipients, icon: Users },
        { label: 'Feedback sent', value: view.metrics.feedbackSent, icon: CheckCircle2 },
        { label: 'Active contacts', value: view.metrics.activeContacts, icon: Inbox },
    ];

    const recentCampaigns: Campaign[] = view.campaigns.slice(0, 6);
    const upcomingFeedback: FeedbackCampaign[] = view.feedbackCampaigns
        .filter((campaign) => campaign.status === 'scheduled' || campaign.status === 'sending')
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 6);

    return (
        <div className={styles.panelStack}>
            {!view.hasDashboard && (
                <div className={styles.notice} role="status">
                    <strong>Limited dashboard.</strong> The Worker serving this page does not expose the full
                    admin dashboard endpoint yet, so showing the legacy campaigns feed. Overview metrics,
                    contact inbox, and settings are only available once{' '}
                    <code>GET /api/newsletter/admin/dashboard</code> is deployed.
                </div>
            )}

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2>At a glance</h2>
                    <span className={styles.panelHint}>Live counts from the newsletter database</span>
                </div>
                <div className={styles.metricGrid}>
                    {metricCards.map((card) => (
                        <div className={styles.metricCard} key={card.label}>
                            <card.icon size={20} className={styles.metricIcon} />
                            <div>
                                <p className={styles.metricValue}>{card.value.toLocaleString()}</p>
                                <p className={styles.metricLabel}>{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className={styles.overviewColumns}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2>Recent campaigns</h2>
                    </div>
                    {recentCampaigns.length === 0 ? (
                        <p className={styles.empty}>No campaigns yet.</p>
                    ) : (
                        <ul className={styles.recentList}>
                            {recentCampaigns.map((campaign) => {
                                const Icon = CAMPAIGN_STATUS_ICONS[campaign.status] ?? Clock;
                                return (
                                    <li key={campaign.id} className={styles.recentItem}>
                                        <Icon size={16} className={styles.metricIcon} />
                                        <div className={styles.recentItemBody}>
                                            <p className={styles.recentItemTitle}>{campaign.name}</p>
                                            <p className={styles.recentItemMeta}>
                                                {campaign.subject} · {formatDate(campaign.scheduled_at ?? campaign.created_at)}
                                            </p>
                                        </div>
                                        <span className={`${styles.chip} ${statusChipClass(campaign.status)}`}>
                                            {STATUS_LABELS[campaign.status] ?? campaign.status}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h2>Upcoming feedback emails</h2>
                    </div>
                    {upcomingFeedback.length === 0 ? (
                        <p className={styles.empty}>No upcoming feedback emails.</p>
                    ) : (
                        <ul className={styles.recentList}>
                            {upcomingFeedback.map((campaign) => (
                                <li key={campaign.id} className={styles.recentItem}>
                                    <CalendarClock size={16} className={styles.metricIcon} />
                                    <div className={styles.recentItemBody}>
                                        <p className={styles.recentItemTitle}>{campaign.event_name}</p>
                                        <p className={styles.recentItemMeta}>
                                            {formatDate(campaign.scheduled_at)} · {' '}
                                            {campaign.sent_count}/{campaign.recipient_count} delivered
                                        </p>
                                    </div>
                                    <span className={`${styles.chip} ${statusChipClass(campaign.status)}`}>
                                        {campaign.status === 'sending' ? 'Sending' : 'Scheduled'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};

export default OverviewSection;
