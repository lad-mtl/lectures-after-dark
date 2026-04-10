import { EventCardRedesign } from './EventCardRedesign';
import { useEvents } from '../hooks/useContent';

interface UpcomingEventsProps {
    title?: string;
    subtitle?: string;
}

export const UpcomingEvents = ({
    title = "UPCOMING EVENTS",
    subtitle = "Curated nights for the curious mind.",
}: UpcomingEventsProps) => {
    const { events, loading } = useEvents();
    const upcomingEvents = events.slice(0, 3);

    return (
        <section
            id="events"
            className="py-16 bg-cream"
        >
            <div className="container mx-auto px-4">
                {/* Header with decorative elements */}
                <div className="container">
                    <div className="flex !mb-8 max-md:flex-col max-md:items-start max-md:!mb-6">
                        <div className="">
                            {/* Title with gold accent */}
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-1 bg-gradient-to-r from-gold to-amber rounded-full max-md:w-8"></div>
                                <h2 className="font-headline text-5xl text-midnight max-md:text-4xl">{title}</h2>
                            </div>

                            {/* Subtitle */}
                            <p className="font-serif text-warm-brown text-lg ml-16 max-md:ml-12">{subtitle}</p>

                            {/* Decorative divider */}
                            <div className="flex items-center gap-3 mt-6 ml-16 max-md:ml-12 max-md:mt-4">
                                <div className="h-[2px] w-20 bg-gradient-to-r from-gold/60 to-transparent"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-gold/60"></div>
                                <div className="h-[2px] w-20 bg-gradient-to-l from-gold/60 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="aspect-[4/5] w-full rounded-2xl bg-midnight/10 animate-pulse"
                            />
                        ))}
                    </div>
                ) : upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="rounded-2xl border border-midnight/10 bg-white/70 px-6 py-10 text-center">
                        <p className="font-headline text-3xl text-midnight">No upcoming events right now.</p>
                        <p className="mt-3 font-serif text-base text-warm-brown">
                            Check back soon for the next lecture night.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default UpcomingEvents;
