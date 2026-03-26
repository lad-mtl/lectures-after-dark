import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <section style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
        }}>
            <h1 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(4rem, 10vw, 8rem)',
                color: 'var(--color-amber)',
                lineHeight: 1,
                marginBottom: '0.5rem',
            }}>
                404
            </h1>
            <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                color: 'var(--color-cream)',
                marginBottom: '2rem',
            }}>
                This page doesn't exist.
            </p>
            <Link
                to="/"
                style={{
                    display: 'inline-block',
                    padding: '0.75rem 2rem',
                    backgroundColor: 'var(--color-amber)',
                    color: 'var(--color-midnight)',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: 600,
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                }}
            >
                Back to Home
            </Link>
        </section>
    );
};

export default NotFound;
