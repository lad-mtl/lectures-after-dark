import React, { useEffect, useRef, useState } from 'react';
import { Mail, MapPin, MessageSquare } from 'lucide-react';
import { TURNSTILE_SITE_KEY } from '../constants';
import styles from './Contact.module.css';

type InquiryType = 'general' | 'partnerships';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        inquiryType: 'general' as InquiryType,
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
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
                action: 'contact',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!turnstileToken) {
            setSubmitState('error');
            setStatusMessage('Please complete the security check.');
            return;
        }

        setSubmitState('submitting');
        setStatusMessage('');
        const submittedForm = new FormData(e.currentTarget);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    website: submittedForm.get('website'),
                    turnstileToken,
                })
            });

            const result = await response.json() as { error?: string };

            if (!response.ok) {
                throw new Error(result.error || 'Unable to send your message right now.');
            }

            setSubmitState('success');
            setStatusMessage('Thanks. Your message has been sent.');
            setFormData({
                inquiryType: 'general',
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setSubmitState('error');
            setStatusMessage(error instanceof Error ? error.message : 'Unable to send your message right now.');
        } finally {
            if (turnstileWidgetIdRef.current && window.turnstile) {
                window.turnstile.reset(turnstileWidgetIdRef.current);
            }
            setTurnstileToken(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Get in Touch</h1>
                <p className={styles.subtitle}>
                    Have a question, a speaker suggestion, or want to host an event? We'd love to hear from you.
                </p>
            </div>

            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h3 className={styles.infoTitle}>
                                <Mail size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                General Inquiries
                            </h3>
                            <p className={styles.infoText}>
                                For questions about tickets, events, or general information.
                            </p>
                            <a href="mailto:core@lecturesafterdark.ca" className={styles.infoLink}>
                                core@lecturesafterdark.ca
                            </a>
                        </div>

                        <div className={styles.infoCard}>
                            <h3 className={styles.infoTitle}>
                                <MessageSquare size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                Partnerships
                            </h3>
                            <p className={styles.infoText}>
                                Interested in sponsoring an event or collaborating with us?
                            </p>
                            <a href="mailto:marketing@lecturesafterdark.ca" className={styles.infoLink}>
                                marketing@lecturesafterdark.ca
                            </a>
                        </div>

                        <div className={styles.infoCard}>
                            <h3 className={styles.infoTitle}>
                                <MapPin size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                Locations
                            </h3>
                            <p className={styles.infoText}>
                                We host events at various speakeasies and lounges across Montreal. Check specific event details for locations.
                            </p>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="inquiryType" className={styles.label}>Inquiry Type</label>
                                <select
                                    id="inquiryType"
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleChange}
                                    className={styles.input}
                                    disabled={submitState === 'submitting'}
                                >
                                    <option value="general">General Inquiries</option>
                                    <option value="partnerships">Partnerships</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={styles.input}
                                    disabled={submitState === 'submitting'}
                                    maxLength={120}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.input}
                                    disabled={submitState === 'submitting'}
                                    maxLength={254}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject" className={styles.label}>Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={styles.input}
                                    disabled={submitState === 'submitting'}
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message" className={styles.label}>Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    disabled={submitState === 'submitting'}
                                    maxLength={5000}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.honeypot} aria-hidden="true">
                                <label htmlFor="contact-website">Website</label>
                                <input
                                    id="contact-website"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            <div className={styles.turnstileRow}>
                                <div ref={turnstileContainerRef} />
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={submitState === 'submitting'}>
                                {submitState === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>

                            {statusMessage && (
                                <p
                                    className={`${styles.statusMessage} ${submitState === 'error' ? styles.statusError : styles.statusSuccess}`}
                                    role={submitState === 'error' ? 'alert' : 'status'}
                                    aria-live="polite"
                                >
                                    {statusMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
