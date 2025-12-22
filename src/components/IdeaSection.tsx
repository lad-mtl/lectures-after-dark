import React from 'react';
import styles from './IdeaSection.module.css';
import { Check } from 'lucide-react';

const IdeaSection: React.FC = () => {
    return (
        <section id="about" className={styles.section}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.content}>
                        <h2>The Idea</h2>
                        <p>
                            Lectures After Dark is a growing movement of intellectual social events that combine academic learning in casual settings with the social experience of a bar.
                        </p>
                        <p>
                            Our events are designed to be accessible to everyone while still offering deep insights. Curiosity is the only requirement.
                        </p>

                        <ul className={styles.list}>
                            <li className={styles.listItem}>
                                <span className={styles.check}><Check size={14} /></span>
                                Fun and Engaging Speakers
                            </li>
                            <li className={styles.listItem}>
                                <span className={styles.check}><Check size={14} /></span>
                                Professors and Industry Leaders
                            </li>
                            <li className={styles.listItem}>
                                <span className={styles.check}><Check size={14} /></span>
                                Education and Entertainment
                            </li>
                        </ul>
                    </div>

                    <div className={styles.imageWrapper}>
                        <img
                            src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Cocktails and Conversation"
                            className={styles.image}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IdeaSection;
