import { useNode } from '@craftjs/core';
import { Card } from './Card';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import styles from './EventCard.module.css';

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
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className={styles.eventCardWrapper}
        >
            <Card
                variant="image-top"
                image={image}
                imageHeight="220px"
                padding="medium"
                hoverable={true}
            >
                <span className={styles.tag}>{tag}</span>
                <h3 className={styles.eventTitle}>{title}</h3>
                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>{date}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <MapPin size={14} />
                        <span>{location}</span>
                    </div>
                </div>
                <div className={styles.footer}>
                    <span className={styles.price}>{price}</span>
                    <a href="#" className={styles.link}>
                        {buttonText} <ArrowRight size={16} />
                    </a>
                </div>
            </Card>
        </div>
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
