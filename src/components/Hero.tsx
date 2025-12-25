
import { useNode } from '@craftjs/core';
import styles from './Hero.module.css';

interface HeroProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    secondaryButtonText?: string;
}

export const Hero = ({
    title = "Lectures After Dark",
    subtitle = "Where Ambition, Psychology & Culture Collide",
    buttonText = "Upcoming Events",
    secondaryButtonText = "Join Our Email List"
}: HeroProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className={styles.hero}
        >
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
                    <img
                        src="/logo.png"
                        alt="Lectures After Dark Logo"
                        className={styles.logoImage}
                        width="200"
                        height="200"
                        loading="eager"
                    />
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
                    <a href="#email-list" className={styles.btnSecondary}>
                        {secondaryButtonText}
                    </a>
                </div>
            </div>
        </section>
    );
};

const HeroSettings = () => {
    const { actions: { setProp }, title, subtitle, buttonText, secondaryButtonText } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
        buttonText: node.data.props.buttonText,
        secondaryButtonText: node.data.props.secondaryButtonText,
    }));

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: HeroProps) => props.title = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Subtitle</label>
                <input
                    type="text"
                    value={subtitle || ''}
                    onChange={(e) => setProp((props: HeroProps) => props.subtitle = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Button Text</label>
                <input
                    type="text"
                    value={buttonText || ''}
                    onChange={(e) => setProp((props: HeroProps) => props.buttonText = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Secondary Button Text</label>
                <input
                    type="text"
                    value={secondaryButtonText || ''}
                    onChange={(e) => setProp((props: HeroProps) => props.secondaryButtonText = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
        </div>
    );
};

(Hero as any).craft = {
    props: {
        title: "Lectures After Dark",
        subtitle: "Where Ambition, Psychology & Culture Collide",
        buttonText: "Upcoming Events",
        secondaryButtonText: "Join Our Email List"
    },
    related: {
        settings: HeroSettings
    },
    rules: {
        deletable: false
    }
};

export default Hero;
