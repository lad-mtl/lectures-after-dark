import React from 'react';
import styles from './UpcomingEvents.module.css';
import { ArrowRight } from 'lucide-react';
import { useNode, Element } from '@craftjs/core';
import { Text } from './user/Text';
import { Button } from './user/Button';
import { EventCard } from './user/EventCard';
import { Container } from './user/Container';

export const UpcomingEvents = () => {
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
            ref={(ref: any) => connect(drag(ref))}
            id="events"
            className={styles.section}
        >
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <Element
                            id="events-title"
                            is={Text}
                            text="Upcoming Events"
                            className={styles.title}
                            tagName="h2"
                            fontSize="3rem"
                            fontFamily="var(--font-headline)"
                            color="var(--midnight)"
                            margin="0 0 0.5rem 0"
                        />
                        <Element
                            id="events-subtitle"
                            is={Text}
                            text="Curated nights for the curious mind."
                            className={styles.subtitle}
                            tagName="p"
                            fontSize="1.1rem"
                            fontFamily="var(--font-serif)"
                            color="var(--warm-brown)"
                        />
                    </div>
                    <Element
                        id="view-all-btn"
                        is={Button as any}
                        text="VIEW ALL EVENTS"
                        variant="outlined"
                        size="medium"
                        padding="12px 24px"
                        textColor="#1a1612"
                        backgroundColor="transparent"
                    />
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
                        <Element
                            is={Container}
                            canvas
                            className={styles.canvasContainer}
                            id="events-canvas"
                            flexDirection="row"
                            width="fit-content"
                            background="transparent"
                            padding={0}
                        >
                            <Element is={EventCard} canvas />
                            <Element is={EventCard} canvas />
                            <Element is={EventCard} canvas />
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

UpcomingEvents.craft = {
    displayName: "Upcoming Events",
    props: {},
    rules: {
        canDrag: () => true,
    },
};
