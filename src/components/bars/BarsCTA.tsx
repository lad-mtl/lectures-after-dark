import styles from '../../pages/Venues.module.css';
import { useVenuePageContent } from '../../hooks/useContent';

interface BarsCTAProps {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
}

export const BarsCTA = ({
    title = "Bring the conversation to your bar.",
    description = "Transform your venue into a hub of intellectual exchange. Host a Lectures After Dark event.",
    buttonText = "Partner With Us",
    buttonLink = "/"
}: BarsCTAProps) => {
    const { pageContent } = useVenuePageContent();
    const resolvedTitle = pageContent?.ctaTitle ?? title;
    const resolvedDescription = pageContent?.ctaDescription ?? description;
    const resolvedButtonText = pageContent?.ctaButtonText ?? buttonText;
    const resolvedButtonLink = pageContent?.ctaButtonLink ?? buttonLink;

    return (
        <section
            className={styles.ctaSection}
        >
            <div className={styles.ctaOverlay}></div>
            <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>{resolvedTitle}</h2>
                <p className={styles.ctaText}>{resolvedDescription}</p>
                <a target='_blank' href={resolvedButtonLink} className="btn btn-primary">{resolvedButtonText}</a>
            </div>
        </section>
    );
};
