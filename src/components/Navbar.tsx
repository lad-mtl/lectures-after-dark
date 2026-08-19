import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import styles from './Navbar.module.css';
import { NAVBAR_SCROLL_THRESHOLD_PERCENT } from '../constants';


const Navbar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHoverPreviewVisible, setIsHoverPreviewVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileViewport, setIsMobileViewport] = useState(
        () => window.matchMedia('(max-width: 768px)').matches,
    );
    const hamburgerRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const mobileMenuRef = useRef<HTMLElement>(null);
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const shouldShowNav = !isHomePage || isMobileViewport || isVisible || isHoverPreviewVisible || isMobileMenuOpen;
    const shouldEnableHoverPreview = isHomePage && !isMobileViewport && !isVisible && !isMobileMenuOpen;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

        updateViewport();
        mediaQuery.addEventListener('change', updateViewport);
        return () => mediaQuery.removeEventListener('change', updateViewport);
    }, []);

    useEffect(() => {
        if (!shouldEnableHoverPreview) return;

        const handlePointerMove = (event: PointerEvent) => {
            setIsHoverPreviewVisible(event.clientY <= 96);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [shouldEnableHoverPreview]);

    useEffect(() => {
        const handleScroll = () => {
            if (!isHomePage) {
                setIsVisible(true);
                return;
            }

            const threshold = window.innerHeight * NAVBAR_SCROLL_THRESHOLD_PERCENT;
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
    }, [isHomePage]);

    // Close mobile menu when route changes
    useEffect(() => {
        // Wrap in setTimeout to avoid synchronous state update warning during render phase
        const timer = setTimeout(() => {
            setIsMobileMenuOpen(false);
            setIsHoverPreviewVisible(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Trap focus in the mobile dialog, support Escape, and restore focus on close.
    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const previouslyFocused = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsMobileMenuOpen(false);
                return;
            }

            if (event.key !== 'Tab' || !mobileMenuRef.current) return;
            const focusableElements = Array.from(
                mobileMenuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (!firstElement || !lastElement) return;

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            if (previouslyFocused?.isConnected) previouslyFocused.focus();
        };
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((isOpen) => !isOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav
                className={`${styles.nav} ${shouldShowNav ? styles.navVisible : ''}`}
                aria-label="Primary navigation"
                aria-hidden={!shouldShowNav}
                inert={!shouldShowNav ? true : undefined}
                onMouseEnter={() => setIsHoverPreviewVisible(true)}
                onMouseLeave={() => setIsHoverPreviewVisible(false)}
                onFocus={() => setIsHoverPreviewVisible(true)}
                onBlur={() => setIsHoverPreviewVisible(false)}
            >
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
                            to="/sponsors"
                            className={({ isActive }) => isActive ? `${styles.link} ${styles.activeLink}` : styles.link}
                        >
                            Sponsors
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
                        ref={hamburgerRef}
                        className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-navigation-dialog"
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
                aria-hidden="true"
                onClick={closeMobileMenu}
            />

            {/* Mobile Menu */}
            <aside
                id="mobile-navigation-dialog"
                ref={mobileMenuRef}
                className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                aria-hidden={!isMobileMenuOpen}
                inert={!isMobileMenuOpen ? true : undefined}
            >
                {/* Mobile Menu Header */}
                <div className={styles.mobileMenuHeader}>
                    <div className={styles.mobileMenuLogo}>
                        <img
                            src="/logo.svg"
                            alt="Logo"
                        />
                        <span>Lectures</span> After Dark
                    </div>
                    <button
                        ref={closeButtonRef}
                        className={styles.closeButton}
                        onClick={closeMobileMenu}
                        aria-label="Close navigation menu"
                    >
                        <X size={24} aria-hidden="true" />
                    </button>
                </div>

                {/* Mobile Menu Links */}
                <div className={styles.mobileLinks}>
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
                    <NavLink
                        to="/sponsors"
                        className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.mobileActiveLink}` : styles.mobileLink}
                    >
                        Sponsors
                    </NavLink>

                    <div className={styles.mobileMenuDivider}></div>

                    <NavLink
                        to="/contact"
                        className={({ isActive }) => isActive ? `${styles.mobileContactBtn} ${styles.mobileContactBtnActive}` : styles.mobileContactBtn}
                    >
                        Contact
                    </NavLink>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
