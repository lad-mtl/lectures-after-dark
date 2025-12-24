import React from 'react';
import { useNode, Element } from '@craftjs/core';
import styles from './UpcomingEvents.module.css';
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
            const scrollAmount = 400; // Adjust scroll amount as needed
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
            className={styles.section}
        >
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>{title}</h2>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </div>
                    <a href="#" className={`btn btn-outline ${styles.viewAllBtn}`}>
                        {buttonText}
                    </a>
                </div>

                <div className={styles.carouselWrapper}>
                    <button
                        onClick={() => scroll('left')}
                        className={`${styles.floatingScrollButton} ${styles.left} ${showLeftButton ? styles.visible : ''}`}
                        aria-label="Scroll left"
                        disabled={!showLeftButton}
                    >
                        <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <div className={styles.scrollContainer} ref={scrollContainerRef}>
                        <Element is="div" id="events-list" canvas className={styles.eventsListCanvas}>
                            <EventCard
                                tag="Psychology"
                                title="The Psychology of Ambition: Why Some People Win and Most Don't"
                                date="Jan 22, 2025"
                                location="Montreal"
                                image="https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            />
                            <EventCard
                                tag="Culture"
                                title="Modern Dating is Negotiating"
                                date="Jan 29, 2025"
                                location="Montreal"
                                image="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            />
                            <EventCard
                                tag="Psychology"
                                title="How Power Really Works"
                                date="Feb 05, 2025"
                                location="Montreal"
                                image="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            />
                        </Element>
                    </div>
                    <button
                        onClick={() => scroll('right')}
                        className={`${styles.floatingScrollButton} ${styles.right}`}
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
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.title = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Subtitle</label>
                <input
                    type="text"
                    value={subtitle || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.subtitle = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Button Text</label>
                <input
                    type="text"
                    value={buttonText || ''}
                    onChange={(e) => setProp((props: UpcomingEventsProps) => props.buttonText = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
        </div>
    );
};

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
