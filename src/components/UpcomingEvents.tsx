import { useNode, useEditor } from '@craftjs/core';

// Safe hook that returns editor state or defaults when outside Editor
const useSafeEditor = () => {
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useEditor((state) => ({
            enabled: state.options.enabled
        }));
    } catch {
        return { enabled: false };
    }
};

// Safe hook that returns node connectors or no-ops when outside Editor
const useSafeNode = () => {
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useNode();
    } catch {
        return {
            connectors: {
                connect: (ref: HTMLElement | null) => ref as HTMLElement,
                drag: (ref: HTMLElement | null) => ref as HTMLElement
            }
        };
    }
};

interface EventCardRedesignProps {
    title?: string;
    day?: string;
    month?: string;
    time?: string;
    location?: string;
    price?: string;
    image?: string;
    eventbriteUrl?: string;
}

const EventCardRedesign = ({
    title = "The Psychology of Ambition: Why Some People Win and Most Don't",
    day = "22",
    month = "JAN",
    time = "7:00",
    location = "Montreal",
    price = "$29.99",
    image = '/the_psychology_of_ambition.webp',
    eventbriteUrl = 'https://www.eventbrite.com'
}: EventCardRedesignProps) => {
    const { enabled } = useSafeEditor();

    const cardContent = (
        <div className="relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer bg-black">
            {/* Background Image */}
            <img
                src={image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark gradient overlay at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-50% to-transparent pointer-events-none"></div>

            {/* Date Badge at Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="backdrop-blur-md bg-black/40 border border-white/20 rounded-xl px-5 py-2.5 text-center">
                    <div className="text-white/90 text-[10px] font-medium tracking-[0.15em] uppercase">
                        {month}
                    </div>
                    <div className="text-white text-2xl font-semibold leading-none mt-0.5">
                        {day}
                    </div>
                </div>
            </div>

            {/* Bottom Content - Absolutely positioned on image */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
                {/* Location, Time, Price row */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span className="text-white/80 text-sm">{location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                        <span className="text-white/80 text-sm">{time}</span>
                    </div>
                    <span className="text-white/80 text-sm">{price}</span>
                </div>

                {/* Title */}
                <h3 className="text-white text-lg font-bold leading-tight uppercase tracking-wide">
                    {title}
                </h3>
            </div>

            {/* Subtle shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );

    if (enabled) {
        return cardContent;
    }

    return (
        <a
            href={eventbriteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full no-underline"
        >
            {cardContent}
        </a>
    );
};

interface UpcomingEventsProps {
    title?: string;
    subtitle?: string;
}

export const UpcomingEvents = ({
    title = "UPCOMING EVENTS",
    subtitle = "Curated nights for the curious mind.",
}: UpcomingEventsProps) => {
    const { connectors: { connect, drag } } = useSafeNode();

    const events = [
        {
            title: "The Psychology of Ambition: Why Some People Win and Most Don't",
            day: "22",
            month: "JAN",
            time: "7:00",
            location: "Montreal",
            price: "$29.99",
            image: "/the_psychology_of_ambition.webp",
        },
        {
            title: "Modern Dating is Negotiating",
            day: "29",
            month: "JAN",
            time: "6:30",
            location: "Montreal",
            price: "$25.00",
            image: "/modern_dating.webp",
        },
        {
            title: "How Power Really Works",
            day: "05",
            month: "FEB",
            time: "8:00",
            location: "Montreal",
            price: "$35.00",
            image: "/how_power_works.webp",
        },
    ];

    return (
        <section
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => (
                        <div
                            key={index}
                            className="aspect-[4/5] max-w-[340px] mx-auto md:mx-0"
                        >
                            <EventCardRedesign {...event} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const UpcomingEventsSettings = () => {
    const { actions: { setProp }, title, subtitle } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
    }));

    return (
        <div className="space-y-4">
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.title = e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Subtitle</label>
                <input
                    type="text"
                    value={subtitle || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.subtitle = e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(UpcomingEvents as any).craft = {
    props: {
        title: "UPCOMING EVENTS",
        subtitle: "Curated nights for the curious mind.",
    },
    related: {
        settings: UpcomingEventsSettings
    }
};

export default UpcomingEvents;
