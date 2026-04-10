import styles from '../../pages/Sponsors.module.css';

interface SponsorsHeaderProps {
    title?: string;
    subtitle?: string;
}

export const SponsorsHeader = ({
    title = "Partner With Lectures After Dark",
    subtitle = "Reach an audience that thinks, drinks, and engages"
}: SponsorsHeaderProps) => {
    return (
        <header
            className={styles.header}
        >
            <div className="container">
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>
        </header>
    );
};
