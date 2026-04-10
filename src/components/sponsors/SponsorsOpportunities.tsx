import { SponsorCard } from '../SponsorCard';
import styles from '../../pages/Sponsors.module.css';

interface SponsorsOpportunitiesProps {
    title?: string;
}

export const SponsorsOpportunities = ({
    title = "Sponsorship Opportunities"
}: SponsorsOpportunitiesProps) => {
    return (
        <section
            className={styles.opportunitiesSection}
        >
            <div className="container">
                <h2 className={styles.sectionTitle}>{title}</h2>
                <div className={styles.opportunitiesGrid}>
                    <div className={styles.cardWrapper}>
                        <SponsorCard
                            name="Beverage Partner"
                            tier="Ideal for: Craft breweries, cocktail brands, wine distributors"
                            description="Featured drink at every event. Brand presence on all promotional materials. Social media mentions."
                            image="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80"
                        />
                    </div>
                    <div className={styles.cardWrapper}>
                        <SponsorCard
                            name="Title Sponsor"
                            tier="Ideal for: Publishers, educational platforms, productivity tools"
                            description="Event naming rights. Speaking opportunities or book giveaways. Logo on website, emails, and social content."
                            image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80"
                        />
                    </div>
                    <div className={styles.cardWrapper}>
                        <SponsorCard
                            name="Speaker Series Sponsor"
                            tier="Ideal for: Tech companies, consulting firms"
                            description="Sponsor an entire topic series. Thought leadership positioning. Content collaboration opportunities."
                            image="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
