import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    CheckCircle2,
    Database,
    HardDrive,
    KeyRound,
    Mail,
    MessageSquareText,
    Plug,
    Save,
    Send,
    Settings as SettingsIcon,
    ShieldCheck,
    Workflow,
    XCircle,
} from 'lucide-react';
import styles from '../NewsletterAdmin.module.css';
import type { SettingSource, SettingValue } from './types';
import {
    INTEGRATION_LABELS,
    SETTING_DEFINITIONS,
    SETTING_GROUPS,
    TEMPLATE_VARIABLES,
    type SettingGroupKey,
} from './settings';
import { saveSettings } from './api';

interface SettingsSectionProps {
    settings: {
        values: Record<string, SettingValue>;
        sources: Record<string, SettingSource>;
    };
    integrations: Record<string, boolean>;
    onStatus: (message: string) => void;
    onError: (message: string) => void;
    onRefresh: () => Promise<void>;
}

const GROUP_ICONS: Record<SettingGroupKey, typeof Mail> = {
    newsletter: Mail,
    contact: Send,
    feedback: MessageSquareText,
    delivery: CalendarDays,
};

const INTEGRATION_ICONS: Record<string, typeof Plug> = {
    eventbrite: CalendarDays,
    turnstile: ShieldCheck,
    email: Mail,
    queue: Workflow,
    r2: HardDrive,
    d1: Database,
    database: Database,
    kv: Database,
};

function SourceBadge({ source }: { source: SettingSource }) {
    const className = source === 'environment'
        ? styles.sourceEnvironment
        : source === 'dashboard'
            ? styles.sourceDashboard
            : styles.sourceDefault;
    return <span className={`${styles.sourceBadge} ${className}`}>{source}</span>;
}

const SettingsSection = ({ settings, integrations, onStatus, onError, onRefresh }: SettingsSectionProps) => {
    const [values, setValues] = useState<Record<string, SettingValue>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setValues({ ...settings.values });
    }, [settings.values]);

    const dirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(settings.values),
        [values, settings.values],
    );

    const updateValue = (key: string, value: SettingValue) => {
        setValues((current) => ({ ...current, [key]: value }));
    };

    const persist = async () => {
        if (saving) return;
        setSaving(true);
        onError('');
        try {
            const editableValues: Record<string, SettingValue> = {};
            for (const definition of SETTING_DEFINITIONS) {
                const value = values[definition.key];
                if (definition.control === 'number' && value === '') continue;
                editableValues[definition.key] = value;
            }
            await saveSettings(editableValues);
            onStatus('Settings saved.');
            await onRefresh();
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Unable to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const integrationEntries = Object.entries(integrations);
    const missingIntegrations = Object.keys(INTEGRATION_LABELS).filter((key) => !(key in integrations));

    return (
        <div className={styles.panelStack}>
            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2><SettingsIcon size={18} /> Runtime settings</h2>
                    <span className={styles.panelHint}>Stored in the dashboard database; overrides environment variables</span>
                </div>

                {SETTING_GROUPS.map((group) => {
                    const GroupIcon = GROUP_ICONS[group.key];
                    const definitions = SETTING_DEFINITIONS.filter((definition) => definition.group === group.key);
                    return (
                        <fieldset className={styles.settingsGroup} key={group.key}>
                            <legend className={styles.settingsGroupLegend}>
                                <GroupIcon size={16} /> {group.label}
                            </legend>
                            <p className={styles.settingsGroupDescription}>{group.description}</p>
                            <div className={styles.settingsFields}>
                                {definitions.map((definition) => {
                                    const value = values[definition.key];
                                    const editable = true;
                                    const showTemplates = definition.help.includes('{{');
                                    return (
                                        <div className={styles.settingsField} key={definition.key}>
                                            <div className={styles.settingsFieldHeader}>
                                                <label htmlFor={`setting-${definition.key}`}>{definition.label}</label>
                                                <SourceBadge
                                                    source={settings.sources[definition.key] ?? 'default'}
                                                />
                                            </div>
                                            {definition.control === 'checkbox' ? (
                                                <label className={styles.checkboxField}>
                                                    <input
                                                        id={`setting-${definition.key}`}
                                                        type="checkbox"
                                                        checked={Boolean(value)}
                                                        disabled={!editable}
                                                        onChange={(event) => updateValue(definition.key, event.target.checked)}
                                                    />
                                                    <span>{String(value) === 'true' ? 'Enabled' : 'Disabled'}</span>
                                                </label>
                                            ) : definition.control === 'textarea' ? (
                                                <textarea
                                                    id={`setting-${definition.key}`}
                                                    value={typeof value === 'string' ? value : ''}
                                                    disabled={!editable}
                                                    rows={5}
                                                    onChange={(event) => updateValue(definition.key, event.target.value)}
                                                />
                                            ) : definition.control === 'number' ? (
                                                <input
                                                    id={`setting-${definition.key}`}
                                                    type="number"
                                                    value={value === undefined || value === '' ? '' : String(value)}
                                                    disabled={!editable}
                                                    min={definition.min}
                                                    max={definition.max}
                                                    onChange={(event) => {
                                                        if (event.target.value === '') {
                                                            updateValue(definition.key, '');
                                                        } else {
                                                            const parsed = Number(event.target.value);
                                                            if (!Number.isNaN(parsed)) updateValue(definition.key, parsed);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <input
                                                    id={`setting-${definition.key}`}
                                                    type={definition.control === 'email' ? 'email' : 'text'}
                                                    value={typeof value === 'string' ? value : ''}
                                                    disabled={!editable}
                                                    placeholder={definition.placeholder}
                                                    onChange={(event) => updateValue(definition.key, event.target.value)}
                                                />
                                            )}
                                            <p className={styles.settingsHelp}>
                                                {definition.help}
                                            </p>
                                            {showTemplates && (
                                                <div className={styles.templateVars}>
                                                    {TEMPLATE_VARIABLES.map((variable) => (
                                                        <code key={variable}>{variable}</code>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </fieldset>
                    );
                })}

                <div className={styles.settingsActions}>
                    <button type="button" className={styles.primaryButton} onClick={() => void persist()} disabled={saving || !dirty}>
                        <Save size={17} /> {saving ? 'Saving…' : 'Save settings'}
                    </button>
                    <span className={styles.panelHint}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2><Plug size={18} /> Integration status</h2>
                    <span className={styles.panelHint}>Services this dashboard depends on</span>
                </div>
                {integrationEntries.length === 0 ? (
                    <p className={styles.empty}>
                        No integration status reported. Available once the dashboard endpoint reports{' '}
                        <code>integrations</code>.
                    </p>
                ) : (
                    <div className={styles.integrationGrid}>
                        {integrationEntries.map(([key, enabled]) => {
                            const Icon = INTEGRATION_ICONS[key] ?? Plug;
                            return (
                                <div className={styles.integrationChip} key={key}>
                                    <Icon size={16} className={enabled ? styles.integrationEnabledIcon : styles.integrationDisabledIcon} />
                                    <span>{INTEGRATION_LABELS[key] ?? key}</span>
                                    {enabled
                                        ? <CheckCircle2 size={16} className={styles.integrationEnabledIcon} />
                                        : <XCircle size={16} className={styles.integrationDisabledIcon} />}
                                </div>
                            );
                        })}
                        {missingIntegrations.map((key) => (
                            <div className={styles.integrationChip} key={key}>
                                <Plug size={16} className={styles.integrationDisabledIcon} />
                                <span>{INTEGRATION_LABELS[key] ?? key}</span>
                                <XCircle size={16} className={styles.integrationDisabledIcon} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <h2><KeyRound size={18} /> Secrets & infrastructure</h2>
                </div>
                <p className={styles.settingsReadOnlyNote}>
                    Secrets and infrastructure bindings — <code>NEWSLETTER_TOKEN_SECRET</code>,{' '}
                    <code>TURNSTILE_SECRET_KEY</code>, <code>EVENTBRITE_API_TOKEN</code>, the{' '}
                    <code>EMAIL</code> binding, Queues, R2 asset storage, D1 and KV — are configured in
                    Cloudflare and are <strong>read-only here</strong>. They are never exposed through this
                    dashboard. Use the Cloudflare dashboard (or CI) to change them.
                </p>
            </section>
        </div>
    );
};

export default SettingsSection;
