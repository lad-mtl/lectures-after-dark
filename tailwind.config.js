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
                    DEFAULT: '#D9532E',
                    light: '#E67E52',
                },
                cream: {
                    DEFAULT: '#F5F0E8',
                    dark: '#D4C7B8',
                    100: '#FFFFFF', // For high contrast text
                },
                gold: '#CC9966',
                'card-bg': '#2A1F1A',
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
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            },
        },
    },
    plugins: [],
}
