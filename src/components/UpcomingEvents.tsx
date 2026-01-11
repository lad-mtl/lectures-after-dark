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
}: UpcomingEventsProps) => {
    const { connectors: { connect, drag } } = useNode();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftButton, setShowLeftButton] = React.useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            setShowLeftButton(scrollContainerRef.current.scrollLeft > 0);
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
            className="pt-12 pb-8 bg-white border-t border-b border-midnight/10"
        >
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

            {/* Carousel - container only on desktop */}
            <div className="md:container">
                <div className="relative">
                    <div className="flex gap-6 overflow-x-auto pb-2 pr-12 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:scroll-snap-x-mandatory max-md:gap-4" ref={scrollContainerRef}>
                        <Element is="div" id="events-list" canvas className="flex gap-6 w-auto max-md:gap-4">
                            <EventCard
                                category="Psychology"
                                title="The Psychology of Ambition: Why Some People Win and Most Don't"
                                date="Jan 22, 2025"
                                time="7:00 PM"
                                location="Montreal"
                                attendeeCount="+120"
                                image="/the_psychology_of_ambition.webp"
                            />
                            <EventCard
                                category="Culture"
                                title="Modern Dating is Negotiating"
                                date="Jan 29, 2025"
                                time="6:30 PM"
                                location="Montreal"
                                attendeeCount="+85"
                                image="/modern_dating.webp"
                            />
                            <EventCard
                                category="Psychology"
                                title="How Power Really Works"
                                date="Feb 05, 2025"
                                time="8:00 PM"
                                location="Montreal"
                                attendeeCount="+200"
                                image="/how_power_works.webp"
                            />
                            <EventCard
                                category="Music"
                                title="The Art of Jazz Improvisation"
                                date="Feb 12, 2025"
                                time="9:00 PM"
                                location="Montreal"
                                attendeeCount="+150"
                                image="https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            />
                        </Element>
                    </div>
                    {showLeftButton && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute top-1/2 -translate-y-1/2 left-[-10px] w-12 h-12 rounded-full bg-cream/90 backdrop-blur-sm shadow-lg border-2 border-gold/30 flex items-center justify-center cursor-pointer z-10 transition-all duration-300 text-gold hover:text-amber hover:scale-110 hover:shadow-xl hover:border-gold/60 animate-fadeIn"
                            aria-label="Scroll left"
                        >
                            <ArrowRight size={20} className="rotate-180" />
                        </button>
                    )}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute top-1/2 -translate-y-1/2 right-[-10px] w-12 h-12 rounded-full bg-cream/90 backdrop-blur-sm shadow-lg border-2 border-gold/30 flex items-center justify-center cursor-pointer z-10 transition-all duration-300 text-gold hover:text-amber hover:scale-110 hover:shadow-xl hover:border-gold/60 animate-pulse-slow"
                        aria-label="Scroll right"
                    >
                        <ArrowRight size={20} />
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
