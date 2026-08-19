import { useEffect, useMemo, useRef, useState } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
    Bold,
    CalendarClock,
    Code2,
    Heading2,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Plus,
    Quote,
    Redo2,
    Save,
    Send,
    Trash2,
    Undo2,
    X,
} from 'lucide-react';
import styles from './NewsletterAdmin.module.css';

interface Campaign {
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

interface CampaignListResponse {
    adminEmail: string;
    subscriberCount: number;
    campaigns: Campaign[];
    error?: string;
}

const BLANK_HTML = '<h1>A new idea after dark</h1><p>Write your announcement here.</p>';

const EmailStyleAttributes = Extension.create({
    name: 'emailStyleAttributes',
    addGlobalAttributes() {
        return [{
            types: ['paragraph', 'heading', 'blockquote', 'link', 'image'],
            attributes: {
                style: {
                    default: null,
                    parseHTML: (element) => element.getAttribute('style'),
                    renderHTML: (attributes) => attributes.style ? { style: String(attributes.style) } : {},
                },
            },
        }];
    },
});

function toLocalDateTime(value: Date) {
    const offset = value.getTimezoneOffset() * 60_000;
    return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

async function apiRequest<T>(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const responseText = await response.text();
    let result: (T & { error?: string }) | null = null;
    if (responseText) {
        try {
            result = JSON.parse(responseText) as T & { error?: string };
        } catch {
            if (!response.ok) throw new Error(`Request failed with status ${response.status}.`);
        }
    }
    if (!response.ok) throw new Error(result?.error || 'The newsletter request failed.');
    if (!result) throw new Error('The newsletter service returned an empty response.');
    return result;
}

const NewsletterAdmin = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [html, setHtml] = useState(BLANK_HTML);
    const [htmlMode, setHtmlMode] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [adminEmail, setAdminEmail] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const [scheduledAt, setScheduledAt] = useState(() => toLocalDateTime(new Date(Date.now() + 10 * 60_000)));
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionBusy, setActionBusy] = useState(false);
    const [previewHtml, setPreviewHtml] = useState(BLANK_HTML);
    const previewFrameRef = useRef<HTMLIFrameElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: { openOnClick: false, autolink: true, linkOnPaste: true },
            }),
            Image.configure({ inline: false, allowBase64: false }),
            EmailStyleAttributes,
        ],
        content: BLANK_HTML,
        immediatelyRender: false,
        onUpdate: ({ editor: activeEditor }) => setHtml(activeEditor.getHTML()),
    });

    const selectedCampaign = useMemo(
        () => campaigns.find((campaign) => campaign.id === selectedId) ?? null,
        [campaigns, selectedId],
    );
    const editable = !selectedCampaign || selectedCampaign.status === 'draft' || selectedCampaign.status === 'scheduled';

    useEffect(() => {
        editor?.setEditable(editable);
    }, [editor, editable]);

    useEffect(() => {
        const timeout = window.setTimeout(() => setPreviewHtml(html), 250);
        return () => window.clearTimeout(timeout);
    }, [html]);

    const loadCampaigns = async (preferredId?: string) => {
        const result = await apiRequest<CampaignListResponse>('/api/newsletter/admin/campaigns');
        setCampaigns(result.campaigns);
        setSubscriberCount(result.subscriberCount);
        setAdminEmail(result.adminEmail);
        if (preferredId) setSelectedId(preferredId);
    };

    useEffect(() => {
        let active = true;
        apiRequest<CampaignListResponse>('/api/newsletter/admin/campaigns')
            .then((result) => {
                if (!active) return;
                setCampaigns(result.campaigns);
                setSubscriberCount(result.subscriberCount);
                setAdminEmail(result.adminEmail);
                setTestEmail(result.adminEmail);
            })
            .catch((error: unknown) => {
                if (active) setErrorMessage(error instanceof Error ? error.message : 'Unable to load campaigns.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const selectCampaign = (campaign: Campaign) => {
        setSelectedId(campaign.id);
        setName(campaign.name);
        setSubject(campaign.subject);
        setPreviewText(campaign.preview_text);
        setHtml(campaign.body_html);
        editor?.commands.setContent(campaign.body_html);
        setScheduledAt(toLocalDateTime(campaign.scheduled_at ? new Date(campaign.scheduled_at) : new Date(Date.now() + 10 * 60_000)));
        setStatusMessage('');
        setErrorMessage('');
    };

    const newCampaign = () => {
        setSelectedId(null);
        setName('');
        setSubject('');
        setPreviewText('');
        setHtml(BLANK_HTML);
        editor?.commands.setContent(BLANK_HTML);
        setScheduledAt(toLocalDateTime(new Date(Date.now() + 10 * 60_000)));
        setStatusMessage('');
        setErrorMessage('');
    };

    const saveCampaign = async () => {
        setSaving(true);
        setStatusMessage('');
        setErrorMessage('');
        try {
            const body = JSON.stringify({ name, subject, previewText, bodyHtml: html });
            let id = selectedId;
            if (selectedId) {
                await apiRequest<{ success: boolean }>(`/api/newsletter/admin/campaigns/${selectedId}`, {
                    method: 'PUT', headers: { 'content-type': 'application/json' }, body,
                });
            } else {
                const result = await apiRequest<{ success: boolean; id: string }>('/api/newsletter/admin/campaigns', {
                    method: 'POST', headers: { 'content-type': 'application/json' }, body,
                });
                id = result.id;
            }
            await loadCampaigns(id ?? undefined);
            setStatusMessage('Draft saved.');
            return id;
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to save the campaign.');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const scheduleCampaign = async () => {
        if (actionBusy) return;
        setActionBusy(true);
        const campaignId = await saveCampaign();
        if (!campaignId) {
            setActionBusy(false);
            return;
        }
        try {
            await apiRequest(`/api/newsletter/admin/campaigns/${campaignId}/schedule`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ scheduledAt: new Date(scheduledAt).toISOString() }),
            });
            await loadCampaigns(campaignId);
            setStatusMessage('Campaign scheduled. You can edit or cancel it until dispatch begins.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to schedule the campaign.');
        } finally {
            setActionBusy(false);
        }
    };

    const cancelCampaign = async () => {
        if (!selectedId || actionBusy) return;
        setActionBusy(true);
        try {
            await apiRequest(`/api/newsletter/admin/campaigns/${selectedId}/cancel`, { method: 'POST' });
            await loadCampaigns(selectedId);
            setStatusMessage('Scheduled delivery cancelled.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to cancel the campaign.');
        } finally {
            setActionBusy(false);
        }
    };

    const deleteCampaign = async () => {
        if (!selectedCampaign || actionBusy) return;
        if (!window.confirm(`Delete “${selectedCampaign.name}”? This cannot be undone.`)) return;

        setActionBusy(true);
        setStatusMessage('');
        setErrorMessage('');
        try {
            await apiRequest(`/api/newsletter/admin/campaigns/${selectedCampaign.id}`, {
                method: 'DELETE',
            });
            newCampaign();
            await loadCampaigns();
            setStatusMessage('Campaign deleted.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to delete the campaign.');
        } finally {
            setActionBusy(false);
        }
    };

    const sendTest = async () => {
        if (actionBusy) return;
        setActionBusy(true);
        const campaignId = await saveCampaign();
        if (!campaignId) {
            setActionBusy(false);
            return;
        }
        try {
            await apiRequest(`/api/newsletter/admin/campaigns/${campaignId}/test`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email: testEmail }),
            });
            setStatusMessage(`Test sent to ${testEmail}.`);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to send the test.');
        } finally {
            setActionBusy(false);
        }
    };

    const addLink = () => {
        const href = window.prompt('Link URL');
        if (href) editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
    };

    const addImageUrl = () => {
        const src = window.prompt('Public image URL');
        if (src) editor?.chain().focus().setImage({ src }).run();
    };

    const uploadImage = async (file: File) => {
        const data = new FormData();
        data.set('asset', file);
        try {
            const result = await apiRequest<{ url: string }>('/api/newsletter/admin/assets', {
                method: 'POST', body: data,
            });
            editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run();
            setStatusMessage('Image uploaded.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to upload the image.');
        }
    };

    const toggleHtmlMode = () => {
        if (htmlMode) editor?.commands.setContent(html);
        setHtmlMode((current) => !current);
    };

    const resetPreviewScroll = () => {
        previewFrameRef.current?.contentWindow?.scrollTo({ top: 0, left: 0 });
    };

    const previewDocument = `<!doctype html><html><head><style>body{margin:0;padding:32px;background:#241c17;color:#d4c7b8;font:16px/1.7 Arial,sans-serif}h1,h2,h3{color:#f5f0e8;text-transform:uppercase;line-height:1.15}a{color:#ff8833}img{max-width:100%;height:auto}blockquote{border-left:3px solid #ff6f00;padding-left:16px;margin-left:0}</style></head><body>${previewHtml}</body></html>`;

    if (loading) return <div className={styles.statePage}>Loading newsletter studio…</div>;
    if (errorMessage && !adminEmail) {
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
                    <p className={styles.eyebrow}>Cloudflare Newsletter Studio</p>
                    <h1>Campaigns</h1>
                    <p>{subscriberCount} confirmed subscribers · Signed in as {adminEmail || 'unknown'}</p>
                </div>
                <button type="button" className={styles.primaryButton} onClick={newCampaign}>
                    <Plus size={17} /> New campaign
                </button>
            </header>

            {errorMessage && <div className={styles.error} role="alert">{errorMessage}</div>}
            {statusMessage && <div className={styles.success} role="status">{statusMessage}</div>}

            <div className={styles.workspace}>
                <aside className={styles.sidebar}>
                    <h2>Recent campaigns</h2>
                    {campaigns.length === 0 && <p className={styles.empty}>No campaigns yet.</p>}
                    {campaigns.map((campaign) => (
                        <button
                            type="button"
                            key={campaign.id}
                            className={`${styles.campaignItem} ${campaign.id === selectedId ? styles.campaignItemActive : ''}`}
                            onClick={() => selectCampaign(campaign)}
                        >
                            <span>{campaign.name}</span>
                            <small>{campaign.status}{campaign.eventbrite_event_id ? ' · Eventbrite' : ''}</small>
                        </button>
                    ))}
                </aside>

                <main className={styles.editorPanel}>
                    <div className={styles.fields}>
                        <label>
                            Internal campaign name
                            <input value={name} onChange={(event) => setName(event.target.value)} disabled={!editable} />
                        </label>
                        <label>
                            Email subject
                            <input value={subject} onChange={(event) => setSubject(event.target.value)} disabled={!editable} />
                        </label>
                        <label>
                            Preview text
                            <input value={previewText} onChange={(event) => setPreviewText(event.target.value)} disabled={!editable} />
                        </label>
                    </div>

                    <div className={styles.editorHeader}>
                        <fieldset className={styles.toolbar} aria-label="Formatting toolbar" disabled={!editable}>
                            <button type="button" title="Heading" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></button>
                            <button type="button" title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={17} /></button>
                            <button type="button" title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={17} /></button>
                            <button type="button" title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={17} /></button>
                            <button type="button" title="Numbered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></button>
                            <button type="button" title="Quote" onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={17} /></button>
                            <button type="button" title="Link" onClick={addLink}><Link2 size={17} /></button>
                            <button type="button" title="Image URL" onClick={addImageUrl}><ImagePlus size={17} /></button>
                            <label className={styles.uploadButton} title="Upload image">
                                <ImagePlus size={17} />
                                <input type="file" accept="image/*" onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) void uploadImage(file);
                                    event.target.value = '';
                                }} aria-label="Upload image" />
                            </label>
                            <button type="button" title="Undo" onClick={() => editor?.chain().focus().undo().run()}><Undo2 size={17} /></button>
                            <button type="button" title="Redo" onClick={() => editor?.chain().focus().redo().run()}><Redo2 size={17} /></button>
                        </fieldset>
                        <button type="button" className={styles.modeButton} onClick={toggleHtmlMode}>
                            {htmlMode ? <><Heading2 size={16} /> Visual</> : <><Code2 size={16} /> HTML</>}
                        </button>
                    </div>

                    <div className={styles.composerGrid}>
                        <div className={styles.editor} aria-disabled={!editable}>
                            {htmlMode ? (
                                <textarea
                                    className={styles.htmlEditor}
                                    value={html}
                                    onChange={(event) => setHtml(event.target.value)}
                                    disabled={!editable}
                                    aria-label="Email HTML"
                                />
                            ) : (
                                <EditorContent editor={editor} />
                            )}
                        </div>
                        <div className={styles.preview}>
                            <div className={styles.previewHeader}>
                                <div className={styles.previewLabel}>Email preview</div>
                                <button type="button" className={styles.previewReset} onClick={resetPreviewScroll}>
                                    Back to top
                                </button>
                            </div>
                            <iframe
                                ref={previewFrameRef}
                                key={selectedId ?? 'new-campaign'}
                                title="Newsletter preview"
                                srcDoc={previewDocument}
                                sandbox="allow-same-origin"
                                onLoad={resetPreviewScroll}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <div className={styles.actionGroup}>
                            <span className={styles.actionLabel}>Changes</span>
                            <div className={styles.changeControls}>
                                <button type="button" className={styles.secondaryButton} onClick={() => void saveCampaign()} disabled={saving || actionBusy || !editable}>
                                    <Save size={17} /> {saving ? 'Saving…' : 'Save draft'}
                                </button>
                                {selectedCampaign && (selectedCampaign.status === 'draft' || selectedCampaign.status === 'cancelled') && (
                                    <button type="button" className={styles.dangerButton} onClick={() => void deleteCampaign()} disabled={actionBusy}>
                                        <Trash2 size={17} /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className={styles.actionGroup}>
                            <label className={styles.actionLabel} htmlFor="newsletter-test-email">Test delivery</label>
                            <div className={styles.testGroup}>
                                <input id="newsletter-test-email" type="email" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="you@example.com" />
                                <button type="button" className={styles.secondaryButton} onClick={() => void sendTest()} disabled={!editable || actionBusy}>
                                    <Send size={17} /> Send test
                                </button>
                            </div>
                        </div>
                        <div className={`${styles.actionGroup} ${styles.scheduleAction}`}>
                            <label className={styles.actionLabel} htmlFor="newsletter-delivery-time">Delivery time</label>
                            <div className={styles.scheduleGroup}>
                                <input id="newsletter-delivery-time" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} disabled={!editable || actionBusy} />
                                <button type="button" className={styles.primaryButton} onClick={() => void scheduleCampaign()} disabled={!editable || actionBusy}>
                                    <CalendarClock size={17} /> Schedule
                                </button>
                                {selectedCampaign?.status === 'scheduled' && (
                                    <button type="button" className={styles.dangerButton} onClick={() => void cancelCampaign()} disabled={actionBusy}>
                                        <X size={17} /> Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NewsletterAdmin;
