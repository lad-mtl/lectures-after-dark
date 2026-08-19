import { useEffect } from 'react';
import styles from './PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'Privacy Policy | Lectures After Dark';
        return () => { document.title = previousTitle; };
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <p className={styles.eyebrow}>Your information</p>
                <h1>Privacy Policy</h1>
                <p className={styles.updated}>Effective August 18, 2026</p>
            </header>

            <main className={styles.content}>
                <section className={styles.intro}>
                    <p>
                        Lectures After Dark respects your privacy. This policy explains what personal information
                        we collect through lecturesafterdark.ca, why we use it, the service providers involved, and
                        the choices available to you.
                    </p>
                </section>

                <section>
                    <h2>1. Who we are</h2>
                    <p>
                        Lectures After Dark organizes live educational and cultural events in Canada. For questions
                        about this policy or your personal information, contact us at{' '}
                        <a href="mailto:core@lecturesafterdark.ca">core@lecturesafterdark.ca</a>.
                    </p>
                </section>

                <section>
                    <h2>2. Information we collect</h2>
                    <h3>Newsletter subscriptions</h3>
                    <p>
                        When you join our newsletter, we collect your email address, subscription status, signup
                        source, consent date and version, and email delivery information such as delivery, bounce,
                        complaint, and unsubscribe status. Confirmation links expire after 24 hours.
                    </p>

                    <h3>Contact requests</h3>
                    <p>
                        When you use our contact form, we collect your name, email address, inquiry type, subject,
                        and message so we can receive and respond to your request.
                    </p>

                    <h3>Website and security information</h3>
                    <p>
                        Our infrastructure may process technical information such as your IP address, browser type,
                        device information, request timestamps, and security signals. Cloudflare Turnstile processes
                        browser and device signals to distinguish people from automated abuse.
                    </p>

                    <h3>Analytics</h3>
                    <p>
                        When Google Analytics is enabled, it may collect information about visits and interactions,
                        including pages viewed, approximate location, device and browser information, and referral
                        sources. Google may use cookies or similar technologies for this purpose.
                    </p>

                    <h3>Event registration</h3>
                    <p>
                        Ticket purchases and event registrations are handled by Eventbrite. Payment and attendee
                        information entered on Eventbrite is collected under Eventbrite&apos;s privacy policy. We may
                        receive event-management information that Eventbrite makes available to organizers.
                    </p>
                </section>

                <section>
                    <h2>3. How we use information</h2>
                    <ul>
                        <li>Send event announcements and newsletter content you requested.</li>
                        <li>Confirm subscriptions and process unsubscribe requests.</li>
                        <li>Respond to questions, speaker proposals, and partnership inquiries.</li>
                        <li>Operate, secure, troubleshoot, and improve our website and services.</li>
                        <li>Understand website performance and audience engagement.</li>
                        <li>Manage events and comply with legal, regulatory, and anti-spam obligations.</li>
                    </ul>
                    <p>
                        We do not sell or rent personal information. Newsletter messages are sent only to confirmed
                        subscribers and include an unsubscribe mechanism, in accordance with applicable Canadian
                        anti-spam requirements.
                    </p>
                </section>

                <section>
                    <h2>4. Service providers and disclosures</h2>
                    <p>We use service providers that process information on our behalf, including:</p>
                    <ul>
                        <li><strong>Cloudflare</strong> for website delivery, security, Turnstile, database storage, file storage, queues, and newsletter and contact-form email delivery.</li>
                        <li><strong>Google Analytics</strong> for website measurement when analytics is enabled.</li>
                        <li><strong>Eventbrite</strong> for event listings, registration, and ticketing.</li>
                        <li><strong>Our content-management hosting providers</strong> for operating the website.</li>
                    </ul>
                    <p>
                        We may also disclose information when required by law, to protect legal rights or safety, or
                        as part of a reorganization involving Lectures After Dark. These providers may process data
                        outside your province or country, where it may be subject to local laws.
                    </p>
                </section>

                <section>
                    <h2>5. Cookies and similar technologies</h2>
                    <p>
                        Essential technologies support security, network delivery, and form protection. Analytics
                        technologies may help us understand use of the site. You can restrict cookies through your
                        browser settings, although some site functionality may be affected. Turnstile operates under
                        Cloudflare&apos;s privacy and data-processing terms.
                    </p>
                </section>

                <section>
                    <h2>6. Retention</h2>
                    <p>
                        We retain personal information only as long as reasonably necessary for the purposes described
                        above and for legal, security, and record-keeping obligations. Newsletter records are generally
                        retained while your subscription is active. After an unsubscribe, bounce, or complaint, we may
                        retain limited suppression information to ensure we do not send further messages. Contact
                        correspondence is retained as needed to address the inquiry and maintain appropriate records.
                    </p>
                </section>

                <section>
                    <h2>7. Security</h2>
                    <p>
                        We use administrative and technical safeguards appropriate to the nature of the information,
                        including access controls, encrypted connections, restricted secrets, and Cloudflare security
                        services. No method of storage or transmission can be guaranteed completely secure.
                    </p>
                </section>

                <section>
                    <h2>8. Your privacy choices and rights</h2>
                    <p>Depending on where you live, you may have the right to:</p>
                    <ul>
                        <li>Request access to or correction of your personal information.</li>
                        <li>Withdraw consent, subject to legal or contractual restrictions.</li>
                        <li>Request deletion of information we no longer need to retain.</li>
                        <li>Ask questions or make a complaint about our privacy practices.</li>
                    </ul>
                    <p>
                        You can unsubscribe from newsletter emails at any time using the link in each message. For
                        other requests, email <a href="mailto:core@lecturesafterdark.ca">core@lecturesafterdark.ca</a>.
                        We may need to verify your identity before completing a request.
                    </p>
                </section>

                <section>
                    <h2>9. Children</h2>
                    <p>
                        Our website and events are not directed to children under 13, and we do not knowingly collect
                        personal information from children under 13 through this website.
                    </p>
                </section>

                <section>
                    <h2>10. External links</h2>
                    <p>
                        Our website links to services and websites we do not control, including Eventbrite and social
                        media platforms. Their privacy practices are governed by their own policies.
                    </p>
                </section>

                <section>
                    <h2>11. Changes to this policy</h2>
                    <p>
                        We may update this policy as our services or legal obligations change. We will post the revised
                        version here and update the effective date. Material changes may also be communicated through
                        the website or newsletter when appropriate.
                    </p>
                </section>

            </main>
        </div>
    );
};

export default PrivacyPolicy;
