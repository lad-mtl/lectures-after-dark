import styles from '../../pages/Speakers.module.css';
import { Mic } from 'lucide-react';
import { useSpeakerPageContent } from '../../hooks/useContent';

interface SpeakersCTAProps {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
}

export const SpeakersCTA = ({
    title = "Share Your Voice",
    description = "If you have a topic you're passionate about, we'd love to hear from you.",
    buttonText = "Apply to Speak",
    buttonLink = "/"
}: SpeakersCTAProps) => {
    const { pageContent } = useSpeakerPageContent();
    const resolvedTitle = pageContent?.ctaTitle ?? title;
    const resolvedDescription = pageContent?.ctaDescription ?? description;
    const resolvedButtonText = pageContent?.ctaButtonText ?? buttonText;
    const resolvedButtonLink = pageContent?.ctaButtonLink ?? buttonLink;

    return (
        <section
            className={styles.ctaSection}
            style={{ backgroundImage: `url(/bg.jpeg)` }}
        >
            <div className={styles.ctaOverlay}></div>
            <div className={styles.ctaContent}>
                <Mic size={48} color="var(--amber)" />
                <h2 className={styles.ctaTitle}>{resolvedTitle}</h2>
                <p className={styles.ctaText}>{resolvedDescription}</p>
                <div className={styles.ctaButtons}>
                    <a target='_blank' href={resolvedButtonLink} className="btn btn-primary">{resolvedButtonText}</a>
                </div>
            </div>
        </section>
    );
};
