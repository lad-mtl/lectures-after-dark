import React, { useState } from 'react';
import styles from './Contact.module.css';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formData);
        alert('Thank you for your message. We will get back to you shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
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
                                <label htmlFor="name" className={styles.label}>Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={styles.input}
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
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
