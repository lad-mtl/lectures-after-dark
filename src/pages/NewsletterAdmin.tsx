import { useCallback, useEffect, useState } from 'react';
import {
    Inbox,
    LayoutDashboard,
    Megaphone,
    MessageSquareText,
    Plus,
    RefreshCw,
    Settings as SettingsIcon,
} from 'lucide-react';
import styles from './NewsletterAdmin.module.css';
import type { AdminView, SectionKey } from './newsletter-admin/types';
import { fetchAdminData } from './newsletter-admin/api';
import CampaignsSection from './newsletter-admin/CampaignsSection';
import OverviewSection from './newsletter-admin/OverviewSection';
import EventFeedbackSection from './newsletter-admin/EventFeedbackSection';
import ContactInboxSection from './newsletter-admin/ContactInboxSection';
import SettingsSection from './newsletter-admin/SettingsSection';

interface TabDefinition {
    key: SectionKey;
    label: string;
    icon: typeof LayoutDashboard;
}

const TABS: TabDefinition[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { key: 'feedback', label: 'Event Feedback', icon: MessageSquareText },
    { key: 'inbox', label: 'Contact Inbox', icon: Inbox },
    { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

const NewsletterAdmin = () => {
    const [view, setView] = useState<AdminView | null>(null);
    const [activeTab, setActiveTab] = useState<SectionKey>('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const refresh = useCallback(async () => {
        setRefreshing(true);
        try {
            setView(await fetchAdminData());
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to load the newsletter dashboard.');
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        fetchAdminData()
            .then((data) => {
                if (active) setView(data);
            })
            .catch((error: unknown) => {
                if (active) {
                    setErrorMessage(error instanceof Error ? error.message : 'Unable to load the newsletter studio.');
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const setStatus = useCallback((message: string) => setStatusMessage(message), []);
    const setError = useCallback((message: string) => setErrorMessage(message), []);

    if (loading) return <div className={styles.statePage}>Loading email operations dashboard…</div>;
    if (!view) {
        return (
            <div className={styles.statePage}>
                <div className={styles.stateCard}>
                    <h1>Newsletter studio unavailable</h1>
                    <p>{errorMessage}</p>
                    <p>Open this route through the configured Cloudflare Access application.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Lectures After Dark · Cloudflare Newsletter Studio</p>
                    <h1>Email operations</h1>
                    <p className={styles.headerMeta}>
                        {view.metrics.subscribers.toLocaleString()} confirmed subscribers · Signed in as{' '}
                        {view.adminEmail || 'unknown'}
                    </p>
                </div>
                <div className={styles.headerActions}>
                    {activeTab === 'campaigns' && (
                        <span className={styles.headerHint}>
                            <Plus size={14} /> Use “New campaign” inside the editor
                        </span>
                    )}
                    <button type="button" className={styles.secondaryButton} onClick={() => void refresh()} disabled={refreshing}>
                        <RefreshCw size={17} className={refreshing ? styles.spinning : undefined} /> {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </header>

            <nav className={styles.tabs} aria-label="Dashboard sections">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            type="button"
                            key={tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </nav>

            {errorMessage && <div className={styles.error} role="alert">{errorMessage}</div>}
            {statusMessage && <div className={styles.success} role="status">{statusMessage}</div>}

            <div className={styles.content}>
                <div className={activeTab === 'overview' ? undefined : styles.sectionHidden}>
                    <OverviewSection view={view} />
                </div>
                <div className={activeTab === 'campaigns' ? undefined : styles.sectionHidden}>
                    <CampaignsSection
                        campaigns={view.campaigns}
                        adminEmail={view.adminEmail}
                        onStatus={setStatus}
                        onError={setError}
                        onRefresh={refresh}
                    />
                </div>
                <div className={activeTab === 'feedback' ? undefined : styles.sectionHidden}>
                    <EventFeedbackSection
                        feedbackCampaigns={view.feedbackCampaigns}
                        settings={view.settings.values}
                        onStatus={setStatus}
                        onError={setError}
                        onRefresh={refresh}
                    />
                </div>
                <div className={activeTab === 'inbox' ? undefined : styles.sectionHidden}>
                    <ContactInboxSection
                        contacts={view.contacts}
                        onStatus={setStatus}
                        onError={setError}
                        onRefresh={refresh}
                    />
                </div>
                <div className={activeTab === 'settings' ? undefined : styles.sectionHidden}>
                    <SettingsSection
                        settings={view.settings}
                        integrations={view.integrations}
                        onStatus={setStatus}
                        onError={setError}
                        onRefresh={refresh}
                    />
                </div>
            </div>
        </div>
    );
};

export default NewsletterAdmin;
