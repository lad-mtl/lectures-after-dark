import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import styles from './Navbar.module.css';


const Navbar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (location.pathname !== '/') {
                setIsVisible(true);
                return;
            }

            // Show navbar after scrolling 20% of the viewport height
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
    }, [location.pathname]);

    // Close mobile menu when route changes
    useEffect(() => {
        // Wrap in setTimeout to avoid synchronous state update warning during render phase
        const timer = setTimeout(() => {
            setIsMobileMenuOpen(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className={`${styles.nav} ${isVisible ? styles.navVisible : ''}`}>
                <div className={styles.container}>
                    <NavLink to="/" className={styles.logo}>
                        <img
                            src="/logo_with_text.svg"
                            alt="Lectures After Dark Logo"
                            className={styles.logoImg}
                            loading="eager"
                        />
                    </NavLink>

                    {/* Desktop Navigation */}
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
                            to="/bars"
                            className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                        >
                            Bars
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

                    {/* Hamburger Button */}
                    <button
                        className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`${styles.overlay} ${isMobileMenuOpen ? styles.overlayVisible : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
                {/* Mobile Menu Header */}
                <div className={styles.mobileMenuHeader}>
                    <div className={styles.mobileMenuLogo}>
                        <span>Lectures</span> After Dark
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Mobile Menu Links */}
                <div className={styles.mobileLinks}>
                    <NavLink
                        to="/events"
                        className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.mobileActiveLink}` : styles.mobileLink}
                    >
                        Events
                    </NavLink>
                    <NavLink
                        to="/speakers"
                        className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.mobileActiveLink}` : styles.mobileLink}
                    >
                        Speakers
                    </NavLink>
                    <NavLink
                        to="/bars"
                        className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.mobileActiveLink}` : styles.mobileLink}
                    >
                        Bars
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.mobileActiveLink}` : styles.mobileLink}
                    >
                        About
                    </NavLink>

                    <div className={styles.mobileMenuDivider}></div>

                    <NavLink
                        to="/contact"
                        className={({ isActive }) => isActive ? `${styles.mobileContactBtn} ${styles.mobileContactBtnActive}` : styles.mobileContactBtn}
                    >
                        Contact
                    </NavLink>
                </div>
            </div>
        </>
    );
};

export default Navbar;
