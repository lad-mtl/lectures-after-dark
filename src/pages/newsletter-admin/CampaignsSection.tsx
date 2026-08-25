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
import styles from '../NewsletterAdmin.module.css';
import type { Campaign } from './types';
import {
    cancelCampaign,
    createCampaign,
    deleteCampaign,
    scheduleCampaign,
    sendTestCampaign,
    updateCampaign,
    uploadAsset,
} from './api';

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

interface CampaignsSectionProps {
    campaigns: Campaign[];
    adminEmail: string;
    onStatus: (message: string) => void;
    onError: (message: string) => void;
    onRefresh: () => Promise<void>;
}

const CampaignsSection = ({ campaigns, adminEmail, onStatus, onError, onRefresh }: CampaignsSectionProps) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [html, setHtml] = useState(BLANK_HTML);
    const [htmlMode, setHtmlMode] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [scheduledAt, setScheduledAt] = useState(() => toLocalDateTime(new Date(Date.now() + 10 * 60_000)));
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

    useEffect(() => {
        if (!testEmail && adminEmail) setTestEmail(adminEmail);
    }, [adminEmail, testEmail]);

    const selectCampaign = (campaign: Campaign) => {
        setSelectedId(campaign.id);
        setName(campaign.name);
        setSubject(campaign.subject);
        setPreviewText(campaign.preview_text);
        setHtml(campaign.body_html);
        editor?.commands.setContent(campaign.body_html);
        setScheduledAt(toLocalDateTime(campaign.scheduled_at ? new Date(campaign.scheduled_at) : new Date(Date.now() + 10 * 60_000)));
        onStatus('');
    };

    const newCampaign = () => {
        setSelectedId(null);
        setName('');
        setSubject('');
        setPreviewText('');
        setHtml(BLANK_HTML);
        editor?.commands.setContent(BLANK_HTML);
        setScheduledAt(toLocalDateTime(new Date(Date.now() + 10 * 60_000)));
        onStatus('');
    };

    const saveCampaign = async () => {
        setSaving(true);
        onStatus('');
        onError('');
        try {
            const body = { name, subject, previewText, bodyHtml: html };
            let id = selectedId;
            if (selectedId) {
                await updateCampaign(selectedId, body);
            } else {
                const result = await createCampaign(body);
                id = result.id;
            }
            await onRefresh();
            if (id) setSelectedId(id);
            onStatus('Draft saved.');
            return id;
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to save the campaign.');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const scheduleCampaignAction = async () => {
        if (actionBusy) return;
        setActionBusy(true);
        const campaignId = await saveCampaign();
        if (!campaignId) {
            setActionBusy(false);
            return;
        }
        try {
            await scheduleCampaign(campaignId, new Date(scheduledAt).toISOString());
            await onRefresh();
            setSelectedId(campaignId);
            onStatus('Campaign scheduled. You can edit or cancel it until dispatch begins.');
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to schedule the campaign.');
        } finally {
            setActionBusy(false);
        }
    };

    const cancelCampaignAction = async () => {
        if (!selectedId || actionBusy) return;
        setActionBusy(true);
        try {
            await cancelCampaign(selectedId);
            await onRefresh();
            setSelectedId(selectedId);
            onStatus('Scheduled delivery cancelled.');
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to cancel the campaign.');
        } finally {
            setActionBusy(false);
        }
    };

    const deleteCampaignAction = async () => {
        if (!selectedCampaign || actionBusy) return;
        if (!window.confirm(`Delete “${selectedCampaign.name}”? This cannot be undone.`)) return;

        setActionBusy(true);
        onStatus('');
        onError('');
        try {
            await deleteCampaign(selectedCampaign.id);
            newCampaign();
            await onRefresh();
            onStatus('Campaign deleted.');
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to delete the campaign.');
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
            await sendTestCampaign(campaignId, testEmail);
            onStatus(`Test sent to ${testEmail}.`);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to send the test.');
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
        try {
            const result = await uploadAsset(file);
            editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run();
            onStatus('Image uploaded.');
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to upload the image.');
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

    return (
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
                <button type="button" className={styles.newCampaignButton} onClick={newCampaign}>
                    <Plus size={15} /> New campaign
                </button>
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
                                <button type="button" className={styles.dangerButton} onClick={() => void deleteCampaignAction()} disabled={actionBusy}>
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
                            <button type="button" className={styles.primaryButton} onClick={() => void scheduleCampaignAction()} disabled={!editable || actionBusy}>
                                <CalendarClock size={17} /> Schedule
                            </button>
                            {selectedCampaign?.status === 'scheduled' && (
                                <button type="button" className={styles.dangerButton} onClick={() => void cancelCampaignAction()} disabled={actionBusy}>
                                    <X size={17} /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CampaignsSection;
