import { useNode } from '@craftjs/core';
import { Card, CardContent, CardFooter } from './ui/Card';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

interface EventCardProps {
    tag?: string;
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    image?: string;
    buttonText?: string;
    price?: string;
    attendeeCount?: string;
}

export const EventCard = ({
    title = "The Psychology of Ambition: Why Some People Win and Most Don't",
    time = '7:00 PM',
    location = 'Montreal',
    image = 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    buttonText = 'Register',
    price = '$29.99',
    attendeeCount = '+30'
}: EventCardProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className="w-[300px] shrink-0"
        >
            <Card className="h-full flex flex-col relative overflow-hidden group bg-card-bg border border-cream/10 hover:border-gold/30 transition-all duration-300">
                {/* Image Section */}
                <div className="relative h-[220px] w-full overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Price Ribbon (Top Left) */}
                    <div className="absolute top-0 left-0 bg-red-900 text-cream px-4 py-2 text-sm font-bold shadow-md z-10">
                        {price}
                    </div>

                    {/* Avatar Group (Top Right) */}
                    <div className="absolute top-3 right-3 flex -space-x-3 z-10">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-midnight bg-gray-300 overflow-hidden">
                                <img
                                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-midnight bg-black/80 text-white text-[10px] font-bold flex items-center justify-center">
                            {attendeeCount}
                        </div>
                    </div>
                </div>

                <CardContent className="flex-1 pt-5 px-5 pb-2">
                    {/* Location & Time Row */}
                    <div className="flex items-center justify-between text-sm text-cream-dark/80 mb-3 font-medium">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-gold" />
                            <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gold" />
                            <span>{time}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-headline text-xl text-cream leading-tight mb-2 line-clamp-2 min-h-[3.5rem]">
                        {title}
                    </h3>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-0 border-t-0 bg-transparent">
                    <button className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-semibold uppercase text-sm tracking-wide group/btn">
                        {buttonText}
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
};

const EventCardSettings = () => {
    const { actions: { setProp }, title, time, location, image, buttonText, price, attendeeCount } = useNode((node) => ({
        title: node.data.props.title,
        time: node.data.props.time,
        location: node.data.props.location,
        image: node.data.props.image,
        buttonText: node.data.props.buttonText,
        price: node.data.props.price,
        attendeeCount: node.data.props.attendeeCount,
    }));

    const inputStyle = {
        width: '100%',
        padding: '8px 10px',
        fontSize: '14px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#475569',
    };

    const fieldStyle = {
        marginBottom: '14px',
    };

    return (
        <div>
            <div style={fieldStyle}>
                <label style={labelStyle}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.title = e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>Time</label>
                <input
                    type="text"
                    value={time || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.time = e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={fieldStyle}>
                <label style={labelStyle}>Location</label>
                <input
                    type="text"
                    value={location || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.location = e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={fieldStyle}>
                <label style={labelStyle}>Image URL</label>
                <input
                    type="text"
                    value={image || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.image = e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={fieldStyle}>
                <label style={labelStyle}>Price</label>
                <input
                    type="text"
                    value={price || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.price = e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={fieldStyle}>
                <label style={labelStyle}>Attendee Count</label>
                <input
                    type="text"
                    value={attendeeCount || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.attendeeCount = e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={fieldStyle}>
                <label style={labelStyle}>Button Text</label>
                <input
                    type="text"
                    value={buttonText || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.buttonText = e.target.value)}
                    style={inputStyle}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(EventCard as any).craft = {
    props: {
        tag: 'Psychology',
        title: "The Psychology of Ambition: Why Some People Win and Most Don't",
        date: 'Jan 22, 2025',
        time: '7:00 PM',
        location: 'Montreal',
        image: 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        buttonText: 'Register',
        price: '$29.99',
        attendeeCount: '+248'
    },
    related: {
        settings: EventCardSettings
    }
};
