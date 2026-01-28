import { useNode, Element } from '@craftjs/core';
import { EventCardRedesign } from './EventCardRedesign';
import { useEditorAwareNode } from '../hooks/useEditorAwareNode';

interface UpcomingEventsProps {
    title?: string;
    subtitle?: string;
}

export const UpcomingEvents = ({
    title = "UPCOMING EVENTS",
    subtitle = "Curated nights for the curious mind.",
}: UpcomingEventsProps) => {
    const { connectors: { connect, drag } } = useEditorAwareNode();

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

                {/* Cards Grid - Using Element canvas for editable cards */}
                <Element
                    is="div"
                    id="events-cards"
                    canvas
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {/* Default cards - will be replaced by saved state from database */}
                    <EventCardRedesign
                        title="The Psychology of Ambition: Why Some People Win and Most Don't"
                        day="22"
                        month="JAN"
                        time="7:00"
                        location="Montreal"
                        price="$29.99"
                        image="/the_psychology_of_ambition.webp"
                    />
                    <EventCardRedesign
                        title="Modern Dating is Negotiating"
                        day="29"
                        month="JAN"
                        time="6:30"
                        location="Montreal"
                        price="$25.00"
                        image="/modern_dating.webp"
                    />
                    <EventCardRedesign
                        title="How Power Really Works"
                        day="05"
                        month="FEB"
                        time="8:00"
                        location="Montreal"
                        price="$35.00"
                        image="/how_power_works.webp"
                    />
                </Element>
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
