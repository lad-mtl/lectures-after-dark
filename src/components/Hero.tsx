
import styles from './Hero.module.css';

interface HeroProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
}

export const Hero = ({
    title = "Lectures After Dark",
    subtitle = "Where Ambition, Psychology & Culture Collide",
    buttonText = "Upcoming Events"
}: HeroProps) => {
    return (
        <section
            className={styles.hero}
        >
            <div className={styles.background}>
                {/* Using a placeholder image that fits the vibe until user provides one */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className={styles.backgroundImage}
                >
                    <source src="/nano_banana_video_optimized.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.logoIcon}>
                    <picture>
                        <source srcSet="/logo.webp" type="image/webp" />
                        <img
                            src="/logo.png"
                            alt="Lectures After Dark Logo"
                            className={styles.logoImage}
                            width="200"
                            height="200"
                            loading="eager"
                        />
                    </picture>
                </div>

                <h1 className={styles.title}>
                    {title}
                </h1>

                <p className={styles.subtitle}>
                    {subtitle}
                </p>

                <div className={styles.buttonGroup}>
                    <a href="#events" className={styles.btnPrimary}>
                        {buttonText}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
