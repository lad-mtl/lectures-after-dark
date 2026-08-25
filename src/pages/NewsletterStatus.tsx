import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailWarning, XCircle } from 'lucide-react';
import styles from './NewsletterStatus.module.css';

const statusContent = {
    confirmed: {
        icon: CheckCircle2,
        title: 'You’re in the inner circle',
        message: 'Your subscription is confirmed. We’ll let you know when the next idea takes the stage.',
    },
    unsubscribed: {
        icon: CheckCircle2,
        title: 'You’ve been unsubscribed',
        message: 'You will no longer receive Lectures After Dark newsletter emails.',
    },
    'feedback-unsubscribed': {
        icon: CheckCircle2,
        title: 'You’ve been unsubscribed',
        message: 'You will no longer receive post-event feedback emails from Lectures After Dark.',
    },
    invalid: {
        icon: XCircle,
        title: 'This link is no longer valid',
        message: 'The link may have expired or already been used. You can submit the signup form again for a fresh confirmation email.',
    },
    default: {
        icon: MailWarning,
        title: 'Check your inbox',
        message: 'Use the confirmation link in your email to finish joining the Lectures After Dark newsletter.',
    },
};

const NewsletterStatus = () => {
    const [searchParams] = useSearchParams();
    const state = searchParams.get('state');
    const content = state === 'confirmed' || state === 'unsubscribed' || state === 'feedback-unsubscribed' || state === 'invalid'
        ? statusContent[state]
        : statusContent.default;
    const Icon = content.icon;

    return (
        <div className={styles.page}>
            <section className={styles.card}>
                <header className={styles.cardHeader}>
                    <p className={styles.brand}>Lectures After Dark</p>
                    <p className={styles.tagline}>Intellectual nightlife for the modern mind</p>
                </header>
                <div className={styles.cardBody}>
                    <Icon className={styles.icon} size={38} aria-hidden="true" />
                    <p className={styles.eyebrow}>{state === 'feedback-unsubscribed' ? 'Event feedback' : 'Newsletter'}</p>
                    <h1 className={styles.title}>{content.title}</h1>
                    <p className={styles.message}>{content.message}</p>
                    <Link to="/" className={styles.link}>Return home</Link>
                </div>
            </section>
        </div>
    );
};

export default NewsletterStatus;
