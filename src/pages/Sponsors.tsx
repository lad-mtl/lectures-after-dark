import { SponsorsHeader, SponsorsWhy, SponsorsOpportunities, SponsorsCTA } from '../components/Sponsors';
import styles from './Sponsors.module.css';

const Sponsors = () => {
    return (
        <div className={styles.pageWrapper}>
            <SponsorsHeader />
            <SponsorsWhy />
            <SponsorsOpportunities />
            <SponsorsCTA />
        </div>
    );
};

export default Sponsors;
