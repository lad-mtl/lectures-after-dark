import { Card } from './Card';
import styles from './SponsorCard.module.css';

interface SponsorCardProps {
    name?: string;
    tier?: string;
    description?: string;
    image?: string;
}

export const SponsorCard = ({
    name = "Sponsor Name",
    tier = "Sponsorship Tier",
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image = "/logo.png",
}: SponsorCardProps) => {
    return (
        <div
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Card
                variant="image-top"
                image={image}
                imageHeight="200px"
                padding="medium"
                hoverable={false}
            >
                <h3 className={styles.sponsorName}>{name}</h3>
                <span className={styles.sponsorTier}>{tier}</span>
                <p className={styles.sponsorDescription}>{description}</p>
            </Card>
        </div>
    );
};
