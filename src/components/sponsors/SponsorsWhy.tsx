import styles from '../../pages/Sponsors.module.css';

interface SponsorsWhyProps {
    title?: string;
}

export const SponsorsWhy = ({
    title = "Why Sponsor Us?"
}: SponsorsWhyProps) => {
    return (
        <section
            className={styles.infoSection}
        >
            <div className="container">
                <div className={styles.infoContent}>
                    <div className={styles.infoText}>
                        <h2>{title}</h2>
                        <p>We don't interrupt the experience, we integrate. Sponsors become part of an intellectual movement, not just another logo on a banner. Associate your brand with curiosity, ambition, and meaningful conversation.</p>
                        <p>Intellectual social events are filling a gap in adult life. As we expand to new cities and venues, early sponsors position themselves at the forefront of this cultural shift.</p>
                    </div>

                    <div className={styles.infoImage}>
                        <picture>
                            <source srcSet="/idea.webp" type="image/webp" />
                            <img
                                src="/idea.png"
                                alt="Cocktails and conversation"
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
                    </div>
                </div>
            </div>
        </section>
    );
};
