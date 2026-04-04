import styles from '../../pages/Venues.module.css';
import { BarCard } from '../BarCard';
import { useVenues } from '../../hooks/useContent';

interface BarsListProps {
    title?: string;
}

export const BarsList = ({
    title = "Partner Bars"
}: BarsListProps) => {
    const { venues, loading } = useVenues();

    return (
        <section
            className={styles.speakersSection}
        >
            <div className="container">
                <h2 className={styles.sectionTitle}>{title}</h2>
                {loading ? (
                    <p style={{ textAlign: 'center', opacity: 0.6 }}>Loading venues...</p>
                ) : venues.length > 0 ? (
                    <div className={styles.speakersGrid}>
                        {venues.map((venue) => (
                            <BarCard
                                key={venue.id}
                                name={venue.name}
                                neighborhood={venue.neighborhood}
                                description={venue.description ?? undefined}
                                imageUrl={venue.imageUrl ?? undefined}
                                mapsLink={venue.mapsLink ?? undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', opacity: 0.6 }}>No venues yet. Add venues in the Strapi admin.</p>
                )}
            </div>
        </section>
    );
};
