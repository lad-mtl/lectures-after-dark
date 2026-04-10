
import styles from './IdeaSection.module.css';

interface IdeaSectionProps {
    title?: string;
    description1?: string;
    description2?: string;
}

export const IdeaSection = ({
    title = "The Idea",
    description1 = "Lectures After Dark is a growing movement of intellectual social events that combine academic learning settings with the social experience of a bar.",
    description2 = "Our events are designed to be accessible to everyone while still offering deep insights. Curiosity is the only requirement."
}: IdeaSectionProps) => {
    return (
        <section
            id="about"
            className={styles.section}
        >
            <div className="container">
                <div className={styles.content}>
                    <div>
                        <div className={styles.titleRow}>
                            <div className={styles.accentBar}></div>
                            <h2 className={styles.title}>{title}</h2>
                        </div>

                        <p className={styles.text}>{description1}</p>
                        <p className={styles.text}>{description2}</p>
                    </div>

                    <div>
                        <div className={styles.imageFrame}>
                            <picture>
                                <source srcSet="/idea.webp" type="image/webp" />
                                <img
                                    src="/idea.png"
                                    alt="Cocktails and Conversation"
                                    className={styles.image}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </picture>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IdeaSection;
