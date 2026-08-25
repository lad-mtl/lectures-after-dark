import { useMemo, useState } from 'react';
import { Archive, Inbox, MailWarning, Search } from 'lucide-react';
import styles from '../NewsletterAdmin.module.css';
import type { ContactSubmission } from './types';
import { archiveContact } from './api';
import { DELIVERY_STATUS_LABELS } from './settings';

type InboxFilter = 'all' | 'active' | 'archived';

interface ContactInboxSectionProps {
    contacts: ContactSubmission[];
    onStatus: (message: string) => void;
    onError: (message: string) => void;
    onRefresh: () => Promise<void>;
}

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function deliveryChipClass(status: string): string {
    const value = status.toLowerCase();
    if (value === 'delivered' || value === 'sent') return styles.chipSuccess;
    if (value === 'bounced' || value === 'failed' || value === 'rejected' || value === 'complained') return styles.chipDanger;
    if (value === 'queued' || value === 'sending' || value === 'deferred') return styles.chipPendingDark;
    return styles.chipNeutral;
}

const ContactInboxSection = ({ contacts, onStatus, onError, onRefresh }: ContactInboxSectionProps) => {
    const [filter, setFilter] = useState<InboxFilter>('all');
    const [query, setQuery] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        return contacts
            .filter((contact) => {
                if (filter === 'active' && contact.archived_at) return false;
                if (filter === 'archived' && !contact.archived_at) return false;
                return true;
            })
            .filter((contact) => {
                if (!trimmed) return true;
                return [contact.name, contact.email, contact.subject, contact.inquiry_type]
                    .some((field) => field?.toLowerCase().includes(trimmed));
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [contacts, filter, query]);

    const archive = async (contact: ContactSubmission) => {
        if (busyId) return;
        setBusyId(contact.id);
        onError('');
        try {
            await archiveContact(contact.id);
            await onRefresh();
            onStatus(`Message from ${contact.name} archived.`);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to archive the message.');
        } finally {
            setBusyId(null);
        }
    };

    const counts = {
        all: contacts.length,
        active: contacts.filter((contact) => !contact.archived_at).length,
        archived: contacts.filter((contact) => contact.archived_at).length,
    };

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <h2><Inbox size={18} /> Contact inbox</h2>
                <span className={styles.panelHint}>Messages submitted through the site contact form</span>
            </div>

            <div className={styles.inboxFilters}>
                <div className={styles.inboxTabs}>
                    {(['all', 'active', 'archived'] as const).map((key) => (
                        <button
                            type="button"
                            key={key}
                            className={`${styles.inboxTab} ${filter === key ? styles.inboxTabActive : ''}`}
                            onClick={() => setFilter(key)}
                        >
                            {key === 'all' ? 'All' : key === 'active' ? 'Active' : 'Archived'}
                            <span className={styles.inboxTabCount}>{counts[key]}</span>
                        </button>
                    ))}
                </div>
                <div className={styles.searchBox}>
                    <Search size={15} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search name, email, subject…"
                        aria-label="Search contacts"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <p className={styles.empty}>No contact messages{query.trim() ? ' match your search' : ''}.</p>
            ) : (
                <ul className={styles.inboxList}>
                    {filtered.map((contact) => (
                        <li key={contact.id} className={`${styles.inboxItem} ${contact.archived_at ? styles.inboxItemArchived : ''}`}>
                            <div className={styles.inboxItemHeader}>
                                <span className={styles.inboxItemName}>{contact.name || 'Anonymous'}</span>
                                <span className={styles.inboxItemEmail}>{contact.email}</span>
                                <span className={styles.inboxItemSpacer} />
                                <span className={styles.chip}>{contact.inquiry_type}</span>
                                <span className={`${styles.chip} ${deliveryChipClass(contact.delivery_status)}`}>
                                    {DELIVERY_STATUS_LABELS[contact.delivery_status?.toLowerCase()] ?? contact.delivery_status ?? 'Unknown'}
                                </span>
                            </div>
                            {contact.subject && <p className={styles.inboxItemSubject}>{contact.subject}</p>}
                            <p className={styles.inboxItemMessage}>{contact.message}</p>
                            <div className={styles.inboxItemFooter}>
                                <span className={styles.inboxItemDate}>
                                    {formatDate(contact.created_at)}{contact.archived_at ? ` · archived ${formatDate(contact.archived_at)}` : ''}
                                </span>
                                {contact.error && (
                                    <span className={styles.inboxItemError} title={contact.error}>
                                        <MailWarning size={14} /> {contact.error}
                                    </span>
                                )}
                                <span className={styles.inboxItemSpacer} />
                                {!contact.archived_at && (
                                    <button type="button" className={styles.secondarySmallButton} onClick={() => void archive(contact)} disabled={busyId === contact.id}>
                                        <Archive size={14} /> {busyId === contact.id ? 'Archiving…' : 'Archive'}
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default ContactInboxSection;
