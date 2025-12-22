import React from 'react';
import styles from './Hero.module.css';
import { Mic } from 'lucide-react';

const Hero: React.FC = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.background}>
                {/* Using a placeholder image that fits the vibe until user provides one */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.backgroundImage}
                >
                    <source src="/nano_banana_video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.logoIcon}>
                    <Mic size={48} strokeWidth={1.5} />
                </div>

                <h1 className={styles.title}>
                    Lectures After Dark
                </h1>

                <p className={styles.subtitle}>
                    Where Ambition, Psychology & Culture Collide
                </p>

                <div className={styles.buttonGroup}>
                    <a href="#events" className={styles.btnPrimary}>
                        View Upcoming Events
                    </a>
                    <a href="#contact" className={styles.btnSecondary}>
                        Join the Email List
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
