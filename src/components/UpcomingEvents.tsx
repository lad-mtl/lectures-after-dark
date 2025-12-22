import React from 'react';
import styles from './UpcomingEvents.module.css';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';

const events = [
    {
        id: 1,
        tag: 'Psychology',
        title: "The Psychology of Ambition: Why Some People Win and Most Don't",
        date: 'Nov 22',
        location: 'Montreal',
        image: 'https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 2,
        tag: 'Culture',
        title: 'Modern Dating',
        date: 'Nov 29',
        location: 'Montreal',
        image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 3,
        tag: 'Power Dynamics',
        title: 'How Power Really Works',
        date: 'Dec 05',
        location: 'Montreal',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
];

const UpcomingEvents: React.FC = () => {
    return (
        <section id="events" className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Upcoming Events</h2>
                        <p className={styles.subtitle}>Curated nights for the curious mind.</p>
                    </div>
                    <a href="#" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        View All Events
                    </a>
                </div>

                <div className={styles.scrollContainer}>
                    {events.map((event) => (
                        <div key={event.id} className={styles.card}>
                            <div className={styles.cardImage}>
                                <img src={event.image} alt={event.title} />
                            </div>
                            <div className={styles.cardContent}>
                                <span className={styles.tag}>{event.tag}</span>
                                <h3 className={styles.cardTitle}>{event.title}</h3>
                                <div className={styles.meta}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Calendar size={14} /> {event.date}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <MapPin size={14} /> {event.location}
                                    </span>
                                </div>
                                <a href="#" className={styles.link}>
                                    Register <ArrowRight size={16} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents;
