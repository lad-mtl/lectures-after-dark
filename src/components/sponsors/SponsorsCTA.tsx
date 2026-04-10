import styles from '../../pages/Sponsors.module.css';

interface SponsorsCTAProps {
    title?: string;
    text?: string;
    buttonText?: string;
    href?: string;
}

export const SponsorsCTA = ({
    title = "Let's Build Something Together",
    text = "We're not just hosting events—we're building a movement. Partner with us to reach an audience that values substance, curiosity, and authentic experiences.",
    buttonText = "Contact Us",
    href = "/contact"
}: SponsorsCTAProps) => {
    return (
        <section
            className={styles.ctaSection}
        >
            <div className={styles.ctaOverlay}></div>
            <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>{title}</h2>
                <p className={styles.ctaText}>{text}</p>
                <a href={href} className={styles.ctaButton}>{buttonText}</a>
            </div>
        </section>
    );
};
