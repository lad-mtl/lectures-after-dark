import { useNode, useEditor } from '@craftjs/core';
import { ImageUploadField } from './ImageUploadField';

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

export const EventCardRedesign = ({
    title = "The Psychology of Ambition: Why Some People Win and Most Don't",
    day = "22",
    month = "JAN",
    time = "7:00",
    location = "Montreal",
    price = "$29.99",
    image = '/the_psychology_of_ambition.webp',
    eventbriteUrl = 'https://www.eventbrite.com'
}: EventCardRedesignProps) => {
    const { connectors: { connect, drag } } = useSafeNode();
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

    return (
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className="aspect-[4/5] max-w-[340px] w-full"
        >
            {enabled ? (
                cardContent
            ) : (
                <a
                    href={eventbriteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full no-underline"
                >
                    {cardContent}
                </a>
            )}
        </div>
    );
};

const EventCardRedesignSettings = () => {
    const {
        actions: { setProp },
        title,
        day,
        month,
        time,
        location,
        image,
        price,
        eventbriteUrl
    } = useNode((node) => ({
        title: node.data.props.title,
        day: node.data.props.day,
        month: node.data.props.month,
        time: node.data.props.time,
        location: node.data.props.location,
        image: node.data.props.image,
        price: node.data.props.price,
        eventbriteUrl: node.data.props.eventbriteUrl,
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
                    onChange={(e) => setProp((props: EventCardRedesignProps) => props.title = e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Day</label>
                    <input
                        type="text"
                        value={day || ''}
                        onChange={(e) => setProp((props: EventCardRedesignProps) => props.day = e.target.value)}
                        style={inputStyle}
                        placeholder="22"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Month</label>
                    <input
                        type="text"
                        value={month || ''}
                        onChange={(e) => setProp((props: EventCardRedesignProps) => props.month = e.target.value)}
                        style={inputStyle}
                        placeholder="JAN"
                    />
                </div>
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>Time</label>
                <input
                    type="text"
                    value={time || ''}
                    onChange={(e) => setProp((props: EventCardRedesignProps) => props.time = e.target.value)}
                    style={inputStyle}
                    placeholder="7:00"
                />
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>Location</label>
                <input
                    type="text"
                    value={location || ''}
                    onChange={(e) => setProp((props: EventCardRedesignProps) => props.location = e.target.value)}
                    style={inputStyle}
                    placeholder="Montreal"
                />
            </div>

            <div style={fieldStyle}>
                <label style={labelStyle}>Price</label>
                <input
                    type="text"
                    value={price || ''}
                    onChange={(e) => setProp((props: EventCardRedesignProps) => props.price = e.target.value)}
                    style={inputStyle}
                    placeholder="$29.99"
                />
            </div>

            <ImageUploadField
                label="Event Image"
                value={image || ''}
                onChange={(newUrl) => setProp((props: EventCardRedesignProps) => props.image = newUrl)}
            />

            <div style={fieldStyle}>
                <label style={labelStyle}>Eventbrite URL</label>
                <input
                    type="text"
                    value={eventbriteUrl || ''}
                    onChange={(e) => setProp((props: EventCardRedesignProps) => props.eventbriteUrl = e.target.value)}
                    style={inputStyle}
                    placeholder="https://www.eventbrite.com/..."
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(EventCardRedesign as any).craft = {
    props: {
        title: "The Psychology of Ambition: Why Some People Win and Most Don't",
        day: '22',
        month: 'JAN',
        time: '7:00',
        location: 'Montreal',
        price: '$29.99',
        image: '/the_psychology_of_ambition.webp',
        eventbriteUrl: 'https://www.eventbrite.com'
    },
    related: {
        settings: EventCardRedesignSettings
    }
};

export default EventCardRedesign;
