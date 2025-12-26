import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { ArrowRight } from 'lucide-react';
import { EventCard } from './EventCard';

interface UpcomingEventsProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
}

export const UpcomingEvents = ({
    title = "Upcoming Events",
    subtitle = "Curated nights for the curious mind.",
    buttonText = "View All Events"
}: UpcomingEventsProps) => {
    const { connectors: { connect, drag } } = useNode();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    // const [showLeftButton, setShowLeftButton] = React.useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            // setShowLeftButton(scrollContainerRef.current.scrollLeft > 0);
        }
    };

    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            // Check initial state
            checkScroll();
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScroll);
            }
        };
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            id="events"
            className="pt-12 pb-8 bg-cream border-t border-b border-midnight/10"
        >
            <div className="container">
                <div className="flex !mb-4 max-md:flex-col max-md:items-start">
                    <div>
                        <h2 className="font-headline text-5xl text-midnight mb-2 max-md:text-4xl">{title}</h2>
                        <p className="font-serif text-warm-brown text-lg">{subtitle}</p>
                    </div>
                </div>

                <div className="relative">
                    <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:scroll-snap-x-mandatory max-md:gap-4" ref={scrollContainerRef}>
                        <Element is="div" id="events-list" canvas className="flex gap-8 w-auto">
                            <EventCard
                                tag="Psychology"
                                title="The Psychology of Ambition: Why Some People Win and Most Don't"
                                date="Jan 22, 2025"
                                time="7:00 PM"
                                location="Montreal"
                                attendeeCount="+120"
                                image="https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            />
                            <EventCard
                                tag="Culture"
                                title="Modern Dating is Negotiating"
                                date="Jan 29, 2025"
                                time="6:30 PM"
                                location="Montreal"
                                attendeeCount="+85"
                                image="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            />
                            <EventCard
                                tag="Psychology"
                                title="How Power Really Works"
                                date="Feb 05, 2025"
                                time="8:00 PM"
                                location="Montreal"
                                attendeeCount="+200"
                                image="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            />
                            <EventCard
                                tag="Music"
                                title="The Art of Jazz Improvisation"
                                date="Feb 12, 2025"
                                time="9:00 PM"
                                location="Montreal"
                                attendeeCount="+150"
                                image="https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            />
                        </Element>
                    </div>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute top-1/2 -translate-y-1/2 right-[-10px] w-10 h-10 bg-transparent border-none flex items-center justify-center cursor-pointer z-10 transition-all duration-300 text-midnight animate-slide-right"
                        aria-label="Scroll right"
                    >
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

const UpcomingEventsSettings = () => {
    const { actions: { setProp }, title, subtitle, buttonText } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
        buttonText: node.data.props.buttonText,
    }));

    return (
        <div className="space-y-4">
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.title = e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Subtitle</label>
                <input
                    type="text"
                    value={subtitle || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.subtitle = e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Button Text</label>
                <input
                    type="text"
                    value={buttonText || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.buttonText = e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(UpcomingEvents as any).craft = {
    props: {
        title: "Upcoming Events",
        subtitle: "Curated nights for the curious mind.",
        buttonText: "View All Events"
    },
    related: {
        settings: UpcomingEventsSettings
    }
};

export default UpcomingEvents;
