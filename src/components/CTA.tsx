import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TURNSTILE_SITE_KEY } from '../constants';
import styles from './CTA.module.css';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const CTA = () => {
    const [email, setEmail] = useState('');
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileContainerRef = useRef<HTMLDivElement>(null);
    const turnstileWidgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let retryTimer: number | undefined;
        let retryCount = 0;

        const renderWidget = () => {
            if (cancelled || turnstileWidgetIdRef.current) return;
            if (!window.turnstile || !turnstileContainerRef.current) {
                retryCount += 1;
                if (retryCount >= 100) {
                    setSubmitState('error');
                    setStatusMessage('The security check could not load. Please refresh and try again.');
                    return;
                }
                retryTimer = window.setTimeout(renderWidget, 100);
                return;
            }

            turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
                sitekey: TURNSTILE_SITE_KEY,
                action: 'newsletter',
                theme: 'dark',
                callback: (token) => {
                    setTurnstileToken(token);
                    setSubmitState('idle');
                    setStatusMessage('');
                },
                'expired-callback': () => setTurnstileToken(null),
                'error-callback': () => {
                    setTurnstileToken(null);
                    setSubmitState('error');
                    setStatusMessage('The security check could not load. Please try again.');
                },
            });
        };

        renderWidget();
        return () => {
            cancelled = true;
            if (retryTimer) window.clearTimeout(retryTimer);
            if (turnstileWidgetIdRef.current && window.turnstile) {
                window.turnstile.remove(turnstileWidgetIdRef.current);
                turnstileWidgetIdRef.current = null;
            }
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!turnstileToken) {
            setSubmitState('error');
            setStatusMessage('Please complete the security check.');
            return;
        }

        setSubmitState('submitting');
        setStatusMessage('');
        const form = new FormData(event.currentTarget);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    email,
                    source: 'home-cta',
                    website: form.get('website'),
                    turnstileToken,
                }),
            });
            const result = await response.json() as { error?: string; message?: string };
            if (!response.ok) {
                throw new Error(result.error || 'Unable to subscribe right now.');
            }

            setSubmitState('success');
            setStatusMessage(result.message || 'Check your inbox to confirm your subscription.');
            setEmail('');
        } catch (error) {
            setSubmitState('error');
            setStatusMessage(error instanceof Error ? error.message : 'Unable to subscribe right now.');
        } finally {
            if (turnstileWidgetIdRef.current && window.turnstile) {
                window.turnstile.reset(turnstileWidgetIdRef.current);
            }
            setTurnstileToken(null);
        }
    };

    return (
        <section id="newsletter" className={styles.section}>
            <div className="container">
                <div className={styles.content}>
                    <p className={styles.eyebrow}>Stay curious</p>
                    <h2 className={styles.title}>Join the Inner Circle</h2>
                    <p className={styles.text}>
                        Be first to hear about newly announced lectures, speakers, and late-night ideas.
                    </p>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <label className={styles.srOnly} htmlFor="newsletter-email">Email address</label>
                        <input
                            type="email"
                            id="newsletter-email"
                            name="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className={styles.input}
                            disabled={submitState === 'submitting'}
                            required
                        />
                        <div className={styles.honeypot} aria-hidden="true">
                            <label htmlFor="newsletter-website">Website</label>
                            <input id="newsletter-website" name="website" tabIndex={-1} autoComplete="off" />
                        </div>
                        <button
                            type="submit"
                            className={styles.button}
                            disabled={submitState === 'submitting'}
                        >
                            {submitState === 'submitting' ? 'Joining…' : 'Notify Me'}
                        </button>
                        <div className={styles.turnstileRow}>
                            <div ref={turnstileContainerRef} />
                        </div>
                    </form>
                    <p className={styles.consent}>
                        By subscribing, you agree to receive event announcements from Lectures After Dark.
                        Unsubscribe at any time. Read our <Link to="/privacy">Privacy Policy</Link>.
                    </p>
                    {statusMessage && (
                        <p
                            className={`${styles.status} ${submitState === 'error' ? styles.statusError : styles.statusSuccess}`}
                            role={submitState === 'error' ? 'alert' : 'status'}
                            aria-live="polite"
                        >
                            {statusMessage}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CTA;
