import React from 'react';

interface PageTabsProps {
    activePageSlug: string;
    onPageChange: (slug: string) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ activePageSlug, onPageChange }) => {
    const tabs = [
        { slug: 'home', label: 'Homepage' },
        { slug: 'speakers', label: 'Speakers' },
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '4px',
            background: '#2c2c2c',
            padding: '8px 16px',
            borderBottom: '1px solid #444',
        }}>
            {tabs.map((tab) => (
                <button
                    key={tab.slug}
                    onClick={() => onPageChange(tab.slug)}
                    style={{
                        padding: '8px 16px',
                        background: activePageSlug === tab.slug ? '#444' : 'transparent',
                        color: activePageSlug === tab.slug ? '#fff' : '#aaa',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activePageSlug === tab.slug ? '600' : '400',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        if (activePageSlug !== tab.slug) {
                            e.currentTarget.style.background = '#333';
                            e.currentTarget.style.color = '#fff';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activePageSlug !== tab.slug) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#aaa';
                        }
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default PageTabs;
