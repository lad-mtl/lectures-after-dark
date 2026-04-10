import React, { useState } from 'react';
import styles from './Contact.module.css';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitState('submitting');
        setStatusMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(formData)
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
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={submitState === 'submitting'}>
                                {submitState === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>

                            {statusMessage && (
                                <p
                                    className={`${styles.statusMessage} ${submitState === 'error' ? styles.statusError : styles.statusSuccess}`}
                                    role="status"
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
