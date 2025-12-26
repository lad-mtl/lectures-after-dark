import { useNode } from '@craftjs/core';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
    tag?: string;
    title?: string;
    date?: string;
    location?: string;
    image?: string;
    buttonText?: string;
    price?: string;
}

export const EventCard = ({
    tag = 'Psychology',
    title = "The Psychology of Ambition: Why Some People Win and Most Don't",
    date = 'Jan 22, 2025',
    location = 'Montreal',
    image = 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    buttonText = 'Register',
    price = '$29.99'
}: EventCardProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <article
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className="bg-card-bg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] cursor-pointer group h-full flex flex-col"
        >
            {/* Image Container - 16:9 Aspect Ratio */}
            <div className="relative w-full aspect-video overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay gradient for better text readability if needed, though design has text below */}
            </div>

            <div className="p-6 flex flex-col flex-grow space-y-4">
                {/* Category Badge */}
                <div>
                    <span className="inline-block px-3 py-1 bg-amber/20 text-amber text-xs font-headline font-semibold uppercase tracking-wider rounded-sm">
                        {tag}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-card-title font-headline font-bold text-cream leading-tight line-clamp-2 min-h-[3rem]">
                    {title}
                </h3>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-cream-dark text-sm font-body">
                    {date && (
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-amber" />
                            <span>{date}</span>
                        </div>
                    )}
                    {location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-amber" />
                            <span>{location}</span>
                        </div>
                    )}
                </div>

                {/* Spacer to push footer to bottom */}
                <div className="flex-grow" />

                {/* Footer: Price and CTA */}
                <div className="flex justify-between items-center pt-4 border-t border-cream/10 mt-auto">
                    <span className="text-xl font-headline font-bold text-cream">
                        {price}
                    </span>
                    <button className="flex items-center gap-2 text-amber font-headline font-semibold uppercase tracking-wider text-sm hover:text-amber-light transition-colors group/btn">
                        {buttonText}
                        <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                </div>
            </div>
        </article>
    );
};

const EventCardSettings = () => {
    const { actions: { setProp }, tag, title, date, location, image, buttonText, price } = useNode((node) => ({
        tag: node.data.props.tag,
        title: node.data.props.title,
        date: node.data.props.date,
        location: node.data.props.location,
        image: node.data.props.image,
        buttonText: node.data.props.buttonText,
        price: node.data.props.price,
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
                <label style={labelStyle}>Tag</label>
                <input
                    type="text"
                    value={tag || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.tag = e.target.value)}
                    style={inputStyle}
                />
            </div>
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
                <label style={labelStyle}>Date</label>
                <input
                    type="text"
                    value={date || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.date = e.target.value)}
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
                <label style={labelStyle}>Button Text</label>
                <input
                    type="text"
                    value={buttonText || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.buttonText = e.target.value)}
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
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(EventCard as any).craft = {
    props: {
        tag: 'Psychology',
        title: "The Psychology of Ambition: Why Some People Win and Most Don't",
        date: 'Jan 22, 2025',
        location: 'Montreal',
        image: 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        buttonText: 'Register',
        price: '$29.99'
    },
    related: {
        settings: EventCardSettings
    }
};
