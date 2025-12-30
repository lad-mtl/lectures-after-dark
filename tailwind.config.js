/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                midnight: '#1a1612',
                'warm-brown': '#3D2B1F',
                amber: {
                    DEFAULT: '#FF6F00',
                    light: '#FF8833',
                },
                cream: {
                    DEFAULT: '#F5F0E8',
                    dark: '#D4C7B8',
                    100: '#FFFFFF', // For high contrast text
                },
                gold: '#CC9966',
                'card-bg': '#2A1F1A',
                // Design System Tokens
                'cta-primary': '#E87456',
                'border-accent': '#C97B54',
            },
            fontFamily: {
                headline: ['var(--font-headline)'],
                serif: ['var(--font-serif)'],
                body: ['var(--font-body)'],
            },
            spacing: {
                'section': 'clamp(3rem, 8vw, 6rem)',
            },
            fontSize: {
                // Standardized scale per report recommendations
                'hero': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.1' }],
                'section-title': ['3.5rem', { lineHeight: '1.2' }], // 56px
                'subsection': ['2rem', { lineHeight: '1.3' }],
                'card-title': ['1.5rem', { lineHeight: '1.4' }],
                // Design System Typography
                'event-title': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }], // 20px
                'event-title-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px
                'event-metadata': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }], // 14px
                'event-price': ['1.125rem', { lineHeight: '1', fontWeight: '700' }], // 18px
                'event-cta': ['1rem', { lineHeight: '1', fontWeight: '500' }], // 16px
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                // Design System Shadows
                'event-card': '0 4px 12px rgba(0, 0, 0, 0.15)',
                'event-card-hover': '0 12px 24px rgba(0, 0, 0, 0.25)',
            },
            keyframes: {
                slideRight: {
                    '0%, 100%': { transform: 'translateY(-50%) translateX(0)' },
                    '50%': { transform: 'translateY(-50%) translateX(5px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSlow: {
                    '0%, 100%': { opacity: '1', transform: 'translateY(-50%) scale(1)' },
                    '50%': { opacity: '0.8', transform: 'translateY(-50%) scale(1.05)' },
                },
            },
            animation: {
                'slide-right': 'slideRight 1.5s ease-in-out infinite',
                'fadeIn': 'fadeIn 0.3s ease-out',
                'pulse-slow': 'pulseSlow 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
