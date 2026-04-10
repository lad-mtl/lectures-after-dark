import styles from '../../pages/Venues.module.css';

interface BarsInfoProps {
    title?: string;
    text1?: string;
    text2?: string;
    imageUrl?: string;
}

export const BarsInfo = ({
    title = "Information for Hosts",
    text1 = "We partner with bars and lounges that already know how to set a mood. We bring the audience, programming, and concept. You bring the space and hospitality.",
    text2 = "If your venue feels intimate, polished, and built for good conversation, it is likely a fit.",
    imageUrl = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
}: BarsInfoProps) => {
    return (
        <section
            className={styles.infoSection}
        >
            <div className="container">
                <div className={styles.infoContent}>
                    <div className={styles.infoText}>
                        <h2>{title}</h2>
                        <p>{text1}</p>
                        <p>{text2}</p>
                    </div>
                    <div className={styles.infoImage}>
                        <img
                            src={imageUrl}
                            alt="Bar interior"
                            style={{ width: '100%', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
