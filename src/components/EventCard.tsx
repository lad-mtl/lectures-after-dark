import { useNode } from '@craftjs/core';
import { Card, CardContent } from './ui/Card';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { useEditorAwareNode, useEditorAwareState } from '../hooks/useEditorAwareNode';
import { settingsStyles } from './settings/settingsStyles';

interface EventCardProps {
    category?: string;
    title?: string;
    day?: string;
    month?: string;
    date?: string;
    time?: string;
    location?: string;
    image?: string;
    price?: string;
    organizer?: string;
    attendeeCount?: string;
    eventbriteUrl?: string;
}

export const EventCard = ({
    category = "Psychology",
    title = "The Psychology of Ambition: Why Some People Win and Most Don't",
    day = "22",
    month = "JAN",
    date = "January 22, 2025",
    time = "06:00 PM",
    location = "Central Park, New York City, United States",
    image = 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    price = "From $99.99",

    attendeeCount = '23+',
    eventbriteUrl = 'https://www.eventbrite.com'
}: EventCardProps) => {
    const { connectors: { connect, drag } } = useEditorAwareNode();
    const { enabled } = useEditorAwareState();

    const cardContent = (
        <div className="max-w-[380px] h-full p-[10px] bg-cream border-2 border-cream-dark rounded-lg shadow-event-card hover:shadow-event-card-hover transition-all duration-300">
            <Card className="h-full flex flex-col relative overflow-hidden rounded-lg bg-cream">
                {/* Image Section */}
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

                    {/* Date Badge (Top Left) */}
                    <div className="absolute top-4 left-4 bg-cream border-2 border-gold rounded-lg shadow-md p-3 text-center min-w-[60px] max-md:min-w-[50px] max-md:p-2 z-10">
                        <div className="text-3xl max-md:text-2xl font-bold text-midnight leading-none">{day}</div>
                        <div className="text-xs max-md:text-[10px] uppercase text-warm-brown mt-1 tracking-wide">{month}</div>
                    </div>

                    {/* Avatar Group (Top Right) */}
                    <div className="absolute top-3 right-3 flex -space-x-3 z-10">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-9 h-9 rounded-full border-2 border-white/30 bg-warm-brown overflow-hidden shadow-md">
                                <img
                                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="w-9 h-9 rounded-full bg-gold text-midnight text-[11px] font-bold flex items-center justify-center shadow-md border-2 border-white/30">
                            {attendeeCount}
                        </div>
                    </div>
                </div>

                <CardContent className="flex-1 flex flex-col px-6 pt-5 pb-4 max-md:!px-5 max-md:!py-3 bg-cream">
                    {/* Category Tag */}
                    <div className="inline-block px-3 py-1 rounded-full bg-amber/10 text-amber text-xs max-md:text-[10px] max-md:px-2 max-md:py-0.5 font-semibold !mb-2 self-start">
                        {category}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl max-md:text-base font-bold text-midnight leading-tight line-clamp-2 !mb-3 max-md:!mb-2">
                        {title}
                    </h3>

                    {/* Details Stack */}
                    <div className="flex flex-col space-y-2.5 max-md:space-y-1">
                        <div className="flex items-center gap-2 text-sm max-md:text-xs text-warm-brown/70">
                            <MapPin size={16} className="text-gold shrink-0 max-md:w-3 max-md:h-3" />
                            <span className="line-clamp-1">{location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm max-md:text-xs text-warm-brown/70">
                            <Calendar size={16} className="text-gold shrink-0 max-md:w-3 max-md:h-3" />
                            <span>{date} • {time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm max-md:text-xs text-warm-brown/70">
                            <DollarSign size={16} className="text-gold shrink-0 max-md:w-3 max-md:h-3" />
                            <span>{price}</span>
                        </div>
                    </div>

                    {/* Spacer to push buttons down */}
                    <div className="flex-1" />

                    {/* CTA Section */}
                    <div className="flex gap-3 max-md:gap-2 pt-3">
                        <button className="flex-1 py-3 max-md:py-2 bg-amber text-cream rounded-lg font-semibold max-md:text-sm hover:bg-amber-light transition-colors">
                            Buy Tickets
                        </button>
                        <button className="flex-1 py-3 max-md:py-2 bg-cream-dark text-warm-brown rounded-lg font-semibold max-md:text-sm hover:bg-cream transition-colors">
                            View Details
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className="w-[380px] h-[460px] shrink-0 max-md:w-[280px] max-md:h-[320px] scroll-snap-align-start transform transition-transform duration-300 hover:scale-[1.02]"
        >
            {enabled ? (
                cardContent
            ) : (
                <a
                    href={eventbriteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full no-underline cursor-pointer"
                >
                    {cardContent}
                </a>
            )}
        </div>
    );
};

const EventCardSettings = () => {
    const {
        actions: { setProp },
        category,
        title,
        day,
        month,
        date,
        time,
        location,
        image,
        price,
        organizer,
        attendeeCount,
        eventbriteUrl
    } = useNode((node) => ({
        category: node.data.props.category,
        title: node.data.props.title,
        day: node.data.props.day,
        month: node.data.props.month,
        date: node.data.props.date,
        time: node.data.props.time,
        location: node.data.props.location,
        image: node.data.props.image,
        price: node.data.props.price,
        organizer: node.data.props.organizer,
        attendeeCount: node.data.props.attendeeCount,
        eventbriteUrl: node.data.props.eventbriteUrl,
    }));

    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Category</label>
                <input
                    type="text"
                    value={category || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.category = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., Psychology, Music, Dance"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Day (for badge)</label>
                <input
                    type="text"
                    value={day || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.day = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., 22"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Month (for badge)</label>
                <input
                    type="text"
                    value={month || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.month = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., JAN"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Full Date</label>
                <input
                    type="text"
                    value={date || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.date = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., January 22, 2025"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Time</label>
                <input
                    type="text"
                    value={time || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.time = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., 06:00 PM"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Location</label>
                <input
                    type="text"
                    value={location || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.location = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>

            <ImageUploadField
                label="Image URL"
                value={image || ''}
                onChange={(newUrl) => setProp((props: EventCardProps) => props.image = newUrl)}
            />

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Price</label>
                <input
                    type="text"
                    value={price || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.price = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., From $99.99"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Organizer</label>
                <input
                    type="text"
                    value={organizer || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.organizer = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., World Fusion Events"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Attendee Count</label>
                <input
                    type="text"
                    value={attendeeCount || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.attendeeCount = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="e.g., 23+"
                />
            </div>

            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Eventbrite URL</label>
                <input
                    type="text"
                    value={eventbriteUrl || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.eventbriteUrl = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(EventCard as any).craft = {
    props: {
        category: 'Psychology',
        title: "The Psychology of Ambition: Why Some People Win and Most Don't",
        day: '22',
        month: 'JAN',
        date: 'January 22, 2025',
        time: '06:00 PM',
        location: 'Central Park, New York City, United States',
        image: 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        price: 'From $99.99',
        organizer: 'World Fusion Events',
        attendeeCount: '23+',
        eventbriteUrl: 'https://www.eventbrite.com'
    },
    related: {
        settings: EventCardSettings
    }
};
