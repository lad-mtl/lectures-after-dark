export type SettingControl = 'text' | 'email' | 'number' | 'checkbox' | 'textarea';

export type SettingGroupKey = 'newsletter' | 'contact' | 'feedback' | 'delivery';

export interface SettingDefinition {
    key: string;
    label: string;
    help: string;
    control: SettingControl;
    group: SettingGroupKey;
    placeholder?: string;
    min?: number;
    max?: number;
}

export interface SettingGroupDefinition {
    key: SettingGroupKey;
    label: string;
    description: string;
}

export const SETTING_GROUPS: SettingGroupDefinition[] = [
    {
        key: 'newsletter',
        label: 'Newsletter emails',
        description: 'Sender identity, reply-to, and the confirmation email subscribers receive.',
    },
    {
        key: 'contact',
        label: 'Contact form',
        description: 'Contact form sender and delivery routing for the site contact page.',
    },
    {
        key: 'feedback',
        label: 'Event feedback',
        description: 'The automated feedback email sent to checked-in attendees after an event.',
    },
    {
        key: 'delivery',
        label: 'Scheduling & delivery',
        description: 'Timing defaults used when scheduling campaigns and feedback emails.',
    },
];

export const SETTING_DEFINITIONS: SettingDefinition[] = [
    // Newsletter emails
    {
        key: 'NEWSLETTER_FROM_EMAIL',
        label: 'Sender address',
        help: 'Email address and display name that sends confirmation and campaign emails.',
        control: 'email',
        group: 'newsletter',
        placeholder: 'Lectures After Dark <newsletter@lecturesafterdark.ca>',
    },
    {
        key: 'NEWSLETTER_REPLY_TO',
        label: 'Reply-to address',
        help: 'Address recipients reach when they reply. Leave empty to keep the sender address.',
        control: 'email',
        group: 'newsletter',
    },
    {
        key: 'NEWSLETTER_CONFIRMATION_SUBJECT',
        label: 'Confirmation subject',
        help: 'Subject line for the double opt-in confirmation email.',
        control: 'text',
        group: 'newsletter',
    },
    {
        key: 'NEWSLETTER_CONFIRMATION_PREVIEW',
        label: 'Confirmation preview text',
        help: 'The snippet shown beside the subject in email clients.',
        control: 'text',
        group: 'newsletter',
    },
    {
        key: 'NEWSLETTER_CONFIRMATION_BODY_HTML',
        label: 'Confirmation body (HTML)',
        help: 'Body of the confirmation email. Supports {{confirmation_url}} for the opt-in link.',
        control: 'textarea',
        group: 'newsletter',
    },

    // Contact form
    {
        key: 'CONTACT_FROM_EMAIL',
        label: 'Sender address',
        help: 'Email address the contact form sends from.',
        control: 'email',
        group: 'contact',
    },
    {
        key: 'CONTACT_CORE_EMAIL',
        label: 'Core inbox',
        help: 'General enquiry messages are delivered here.',
        control: 'email',
        group: 'contact',
    },
    {
        key: 'CONTACT_MARKETING_EMAIL',
        label: 'Marketing inbox',
        help: 'Partnership and marketing messages are delivered here.',
        control: 'email',
        group: 'contact',
    },
    {
        key: 'CONTACT_SUBJECT_PREFIX',
        label: 'Subject prefix',
        help: 'Prepended to contact form email subjects, e.g. “Lectures After Dark”.',
        control: 'text',
        group: 'contact',
    },

    // Event feedback
    {
        key: 'EVENT_FEEDBACK_ENABLED',
        label: 'Enable event feedback emails',
        help: 'Master switch for the automated feedback email to checked-in attendees.',
        control: 'checkbox',
        group: 'feedback',
    },
    {
        key: 'EVENT_FEEDBACK_SEND_HOUR',
        label: 'Send hour (24h)',
        help: 'Hour of day the feedback email is dispatched, e.g. 10 for 10:00 a.m.',
        control: 'number',
        group: 'feedback',
        min: 0,
        max: 23,
    },
    {
        key: 'EVENT_FEEDBACK_FORM_URL',
        label: 'Feedback form URL',
        help: 'Link embedded in the feedback email. Supports {{event_name}}.',
        control: 'text',
        group: 'feedback',
        placeholder: 'https://forms.example.com/feedback',
    },
    {
        key: 'EVENT_FEEDBACK_FROM_EMAIL',
        label: 'Sender address',
        help: 'Email address the feedback email is sent from.',
        control: 'email',
        group: 'feedback',
    },
    {
        key: 'EVENT_FEEDBACK_SUBJECT_TEMPLATE',
        label: 'Subject template',
        help: 'Supports {{event_name}}. Example: “How was {{event_name}}?”',
        control: 'text',
        group: 'feedback',
    },
    {
        key: 'EVENT_FEEDBACK_PREVIEW_TEXT',
        label: 'Preview text',
        help: 'Snippet shown beside the subject in email clients. Supports {{event_name}}.',
        control: 'text',
        group: 'feedback',
    },
    {
        key: 'EVENT_FEEDBACK_BODY_HTML',
        label: 'Body (HTML)',
        help: 'Body of the feedback email. Supports {{event_name}} and {{form_url}}.',
        control: 'textarea',
        group: 'feedback',
    },

    // Scheduling & delivery
    {
        key: 'EVENTBRITE_SEND_DELAY_MINUTES',
        label: 'Default send delay (minutes)',
        help: 'Delay before Eventbrite announcement campaigns send, and the fallback delay when a campaign has no explicit delivery time.',
        control: 'number',
        group: 'delivery',
        min: 1,
    },
];

export const TEMPLATE_VARIABLES = ['{{event_name}}', '{{form_url}}', '{{confirmation_url}}'];

export const INTEGRATION_LABELS: Record<string, string> = {
    eventbrite: 'Eventbrite',
    turnstile: 'Turnstile',
    email: 'Cloudflare Email',
    queue: 'Message Queue',
    r2: 'R2 Asset Storage',
    d1: 'D1 Database',
    database: 'D1 Database',
    kv: 'Content Cache KV',
    site: 'Site API',
};

/** Full names for delivery statuses returned by contact submissions. */
export const DELIVERY_STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    delivered: 'Delivered',
    sent: 'Delivered',
    queued: 'Queued',
    sending: 'Sending',
    deferred: 'Deferred',
    bounced: 'Bounced',
    complained: 'Complained',
    failed: 'Failed',
    rejected: 'Rejected',
};
