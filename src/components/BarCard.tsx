import styles from './BarCard.module.css';
import { MapPin } from 'lucide-react';

interface BarCardProps {
    name?: string;
    neighborhood?: string;
    description?: string;
    imageUrl?: string;
    mapsLink?: string;
}

export const BarCard = ({
    name = "Bar Name",
    neighborhood = "Neighborhood",
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    imageUrl = "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    mapsLink = "https://maps.app.goo.gl/sLmJFrbS25dbyEzR7"
}: BarCardProps) => {
    return (
        <div
            className={styles.card}
        >
            <a target='_blank' href={mapsLink} rel="noopener noreferrer" className={styles.cardLink}>
                <div className={styles.imageWrapper}>
                    <img src={imageUrl} alt={name} className={styles.image} />
                </div>
                <h3 className={styles.name}>{name}</h3>
                <span className={styles.neighborhood}>
                    <MapPin size={14} /> {neighborhood}
                </span>
                <p className={styles.description}>{description}</p>
            </a>
        </div>
    );
};
