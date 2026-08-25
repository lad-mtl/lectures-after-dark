import { useState } from 'react';
import { CalendarClock, MessageSquareText, X } from 'lucide-react';
import styles from '../NewsletterAdmin.module.css';
import type { FeedbackCampaign, SettingValue } from './types';
import { cancelFeedbackCampaign, createFeedbackCampaign } from './api';

interface EventFeedbackSectionProps {
    feedbackCampaigns: FeedbackCampaign[];
    settings: Record<string, SettingValue>;
    onStatus: (message: string) => void;
    onError: (message: string) => void;
    onRefresh: () => Promise<void>;
}

function formatDateTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const EventFeedbackSection = ({ feedbackCampaigns, settings, onStatus, onError, onRefresh }: EventFeedbackSectionProps) => {
    const [eventbriteEventId, setEventbriteEventId] = useState('');
    const enabled = settings.EVENT_FEEDBACK_ENABLED !== false;
    const sendHour = Number(settings.EVENT_FEEDBACK_SEND_HOUR ?? 10);
    const [busy, setBusy] = useState(false);

    const addFeedbackCampaign = async () => {
        if (!eventbriteEventId.trim() || busy) return;
        setBusy(true);
        onError('');
        try {
            await createFeedbackCampaign(eventbriteEventId.trim());
            await onRefresh();
            setEventbriteEventId('');
            onStatus(`Event feedback email scheduled for ${String(sendHour).padStart(2, '0')}:00 the morning after the event.`);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to schedule event feedback.');
        } finally {
            setBusy(false);
        }
    };

    const cancelFeedback = async (campaign: FeedbackCampaign) => {
        if (busy) return;
        setBusy(true);
        onError('');
        try {
            await cancelFeedbackCampaign(campaign.id);
            await onRefresh();
            onStatus(`Feedback email for ${campaign.event_name} cancelled.`);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to cancel event feedback.');
        } finally {
            setBusy(false);
        }
    };

    const sorted = [...feedbackCampaigns].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    );

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2><MessageSquareText size={18} /> Event feedback emails</h2>
                <span className={styles.panelHint}>Checked-in attendees · next morning at {String(sendHour).padStart(2, '0')}:00</span>
            </div>

            <div className={styles.inlineForm}>
                <input
                    value={eventbriteEventId}
                    onChange={(event) => setEventbriteEventId(event.target.value)}
                    inputMode="numeric"
                    placeholder="Eventbrite event ID"
                    aria-label="Eventbrite event ID"
                />
                <button type="button" className={styles.secondaryButton} onClick={() => void addFeedbackCampaign()} disabled={!enabled || busy || !eventbriteEventId.trim()}>
                    <CalendarClock size={16} /> Schedule feedback
                </button>
            </div>

            {!enabled && <p className={styles.notice}>Feedback automation is disabled in Settings.</p>}

            {sorted.length === 0 ? (
                <p className={styles.empty}>No feedback emails yet. Enter an Eventbrite event ID above to schedule one.</p>
            ) : (
                <div className={styles.feedbackTable}>
                    <div className={styles.feedbackRowHeader}>
                        <span>Event</span>
                        <span>Status</span>
                        <span>Delivery</span>
                        <span>Scheduled</span>
                        <span />
                    </div>
                    {sorted.map((campaign) => (
                        <div className={styles.feedbackRow} key={campaign.id}>
                            <div className={styles.feedbackEventName}>
                                {campaign.event_name}
                                <small>Eventbrite {campaign.eventbrite_event_id}</small>
                            </div>
                            <span className={`${styles.chip} ${styles.chipPending}`}>{campaign.status}</span>
                            <span className={styles.feedbackProgress}>
                                {campaign.sent_count}/{campaign.recipient_count}
                            </span>
                            <span className={styles.feedbackDate}>{formatDateTime(campaign.scheduled_at)}</span>
                            <span className={styles.feedbackActions}>
                                {campaign.status === 'scheduled' && (
                                    <button type="button" className={styles.secondarySmallButton} onClick={() => void cancelFeedback(campaign)} disabled={busy}>
                                        <X size={14} /> Cancel
                                    </button>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default EventFeedbackSection;
