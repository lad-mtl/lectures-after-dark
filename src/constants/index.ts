/**
 * Percentage of viewport height to scroll before showing the navbar.
 * Used in Navbar.tsx for scroll-triggered visibility.
 */
export const NAVBAR_SCROLL_THRESHOLD_PERCENT = 0.1;

export const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)
    ?? '0x4AAAAAAEUrPMX10CXxRobg';

export const INSTAGRAM_USERNAME = "lad_mtl";
export const INSTAGRAM_HANDLE = `@${INSTAGRAM_USERNAME}`;
export const INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;

export const EVENTBRITE_PROFILE_URL = "https://www.eventbrite.ca/o/lectures-after-dark-121002246833";
