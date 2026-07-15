import { EventCardRedesign } from './EventCardRedesign';
import { useEvents } from '../hooks/useContent';
import { EVENTBRITE_PROFILE_URL } from '../constants';
import styles from './UpcomingEvents.module.css';

interface UpcomingEventsProps {
    title?: string;
}

export const UpcomingEvents = ({
    title = "EVENTS",
}: UpcomingEventsProps) => {
    const { events, loading } = useEvents();
    const upcomingEvents = events
        .filter((event) => !event.isPast)
        .sort(
            (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt),
        );
    const pastEvents = events
        .filter((event) => event.isPast)
        .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt));
    const displayedEvents = [...upcomingEvents, ...pastEvents].slice(0, 4);

    const renderEvents = (eventList: typeof events) => (
        <div className={styles.grid}>
            {eventList.map((event) => (
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
                    isPast={event.isPast}
                />
            ))}
        </div>
    );

    const hasUpcomingEvents = upcomingEvents.length > 0;

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
                                className="aspect-[16/10] w-full rounded-2xl bg-midnight/10 animate-pulse"
                            />
                        ))}
                    </div>
                ) : displayedEvents.length > 0 ? (
                    <>
                        {!hasUpcomingEvents && (
                            <p className={styles.statusText}>
                                No upcoming events right now — here are some past lectures.
                            </p>
                        )}
                        {renderEvents(displayedEvents)}
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyTitle}>No events listed right now.</p>
                        <p className={styles.emptyText}>
                            Check Eventbrite or come back soon for the next lecture night.
                        </p>
                    </div>
                )}

                <div className={styles.ctaRow}>
                    <a
                        className={styles.eventbriteLink}
                        href={EVENTBRITE_PROFILE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View all events on Eventbrite
                    </a>
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents;
