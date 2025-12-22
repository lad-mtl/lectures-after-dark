import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import { Mic } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show navbar after scrolling 20% of the viewport height
            // This gives a "getting past the landing page" feel
            const threshold = window.innerHeight * 0.2;
            if (window.scrollY > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Check initial position
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.nav} ${isVisible ? styles.navVisible : ''}`}>
            <div className={styles.container}>
                <NavLink to="/" className={styles.logo}>
                    <Mic size={24} />
                    <span className={styles.highlightText}>Lectures</span>&nbsp;After Dark
                </NavLink>
                <div className={styles.links}>
                    <NavLink
                        to="/events"
                        className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                    >
                        Events
                    </NavLink>
                    <NavLink
                        to="/speakers"
                        className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                    >
                        Speakers
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                    >
                        About
                    </NavLink>
                    <NavLink
                        to="/contact"
                        className={({ isActive }) => isActive ? `${styles.contactBtn} ${styles.contactBtnActive}` : styles.contactBtn}
                    >
                        Contact
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
