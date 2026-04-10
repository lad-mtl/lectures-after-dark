import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { INSTAGRAM_PROFILE_URL } from '../constants';

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <h3>LECTURES AFTER DARK</h3>
                        <p>Intellectual nightlife for the modern mind.</p>
                    </div>

                    <div className={styles.col}>
                        <h4>Resources</h4>
                        <ul>
                            <li><Link to="/bars">Bars</Link></li>
                            <li><Link to="/speakers">Speakers</Link></li>
                            <li><Link to="/sponsors">Sponsors</Link></li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h4>Get Involved</h4>
                        <ul>
                            <li><Link to="/speakers">Become a Speaker</Link></li>
                            <li><Link to="/bars">Host an Event</Link></li>
                            <li><Link to="/about">About</Link></li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h4>Connect</h4>
                        <ul>
                            <li>
                                <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
                                    Instagram
                                </a>
                            </li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.copyright}>
                    &copy; 2025 Lectures After Dark. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
