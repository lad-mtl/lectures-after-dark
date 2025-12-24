import React from 'react';
import styles from './WhyWeDoIt.module.css';

const WhyWeDoIt: React.FC = () => {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.content}>
                    <span className={styles.kicker}>Why We Do It</span>
                    <h2 className={styles.title}>Making learning a night out is why we do it.</h2>
                    <div className={styles.bodyText}>
                        <p>
                            A lot of us miss that campus vibe — hearing a great idea, debating it after, and leaving with something that sticks. Lectures After Dark brings that back, just in a bar: relaxed, social, and actually fun.
                        </p>
                        <p>
                            It’s for people who want to keep learning without going back to school. For anyone who loves real conversation more than just another drink.
                        </p>
                        <p>
                            And honestly? It’s a break from endless scrolling and fake “facts.” Real ideas, real speakers, real people — all in one room, and it’s a vibe.
                        </p>
                    </div>
                    <div style={{ marginTop: '3rem' }}>
                        <a href="https://instagram.com" className="btn" style={{
                            backgroundColor: 'var(--midnight)',
                            color: 'var(--cream)',
                            border: 'none'
                        }}>
                            Follow us on Instagram
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyWeDoIt;
