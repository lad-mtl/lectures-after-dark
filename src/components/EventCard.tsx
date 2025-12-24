import { useNode } from '@craftjs/core';
import styles from './UpcomingEvents.module.css';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
    tag?: string;
    title?: string;
    date?: string;
    location?: string;
    image?: string;
    buttonText?: string;
}

export const EventCard = ({
    tag = 'Psychology',
    title = "The Psychology of Ambition: Why Some People Win and Most Don't",
    date = 'Jan 22, 2025',
    location = 'Montreal',
    image = 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    buttonText = 'Register'
}: EventCardProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className={styles.card}
        >
            <div className={styles.cardImage}>
                <img src={image} alt={title} />
            </div>
            <div className={styles.cardContent}>
                <span className={styles.tag}>{tag}</span>
                <h3 className={styles.cardTitle}>{title}</h3>
                <div className={styles.meta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} /> {date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {location}
                    </span>
                </div>
                <a href="#" className={styles.link}>
                    {buttonText} <ArrowRight size={16} />
                </a>
            </div>
        </div>
    );
};

const EventCardSettings = () => {
    const { actions: { setProp }, tag, title, date, location, image, buttonText } = useNode((node) => ({
        tag: node.data.props.tag,
        title: node.data.props.title,
        date: node.data.props.date,
        location: node.data.props.location,
        image: node.data.props.image,
        buttonText: node.data.props.buttonText,
    }));

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Tag</label>
                <input
                    type="text"
                    value={tag || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.tag = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.title = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
                <input
                    type="text"
                    value={date || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.date = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Location</label>
                <input
                    type="text"
                    value={location || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.location = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Image URL</label>
                <input
                    type="text"
                    value={image || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.image = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Button Text</label>
                <input
                    type="text"
                    value={buttonText || ''}
                    onChange={(e) => setProp((props: EventCardProps) => props.buttonText = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
        </div>
    );
};

(EventCard as any).craft = {
    props: {
        tag: 'Psychology',
        title: "The Psychology of Ambition: Why Some People Win and Most Don't",
        date: 'Jan 22, 2025',
        location: 'Montreal',
        image: 'https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        buttonText: 'Register'
    },
    related: {
        settings: EventCardSettings
    }
};
