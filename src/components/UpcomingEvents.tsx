import { EventCardRedesign } from './EventCardRedesign';
import { useEvents } from '../hooks/useContent';
import styles from './UpcomingEvents.module.css';

interface UpcomingEventsProps {
    title?: string;
}

export const UpcomingEvents = ({
    title = "UPCOMING EVENTS",
}: UpcomingEventsProps) => {
    const { events, loading } = useEvents();
    const upcomingEvents = events.slice(0, 3);

    return (
        <section
            id="events"
            className={styles.section}
        >
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.accentBar}></div>
                        <h2 className={styles.title}>{title}</h2>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.grid}>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="aspect-[4/5] w-full rounded-2xl bg-midnight/10 animate-pulse"
                            />
                        ))}
                    </div>
                ) : upcomingEvents.length > 0 ? (
                    <div className={styles.grid}>
                        {upcomingEvents.map((event) => (
                            <EventCardRedesign
                                key={event.id}
                                title={event.title}
                                day={event.day}
                                month={event.month}
                                timeLabel={event.timeLabel}
                                locationLabel={event.locationLabel}
                                priceLabel={event.priceLabel}
                                imageUrl={event.imageUrl}
                                eventbriteUrl={event.eventbriteUrl}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyTitle}>No upcoming events right now.</p>
                        <p className={styles.emptyText}>
                            Check back soon for the next lecture night.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default UpcomingEvents;
