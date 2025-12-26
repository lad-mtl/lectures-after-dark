import React from 'react'

interface SectionTitleProps {
    children: React.ReactNode
    className?: string
    dark?: boolean // For light backgrounds
}

export default function SectionTitle({
    children,
    className = '',
    dark = false
}: SectionTitleProps) {
    const textColor = dark ? 'tw-text-midnight' : 'tw-text-cream'

    return (
        <h2 className={`tw-text-section-title tw-font-headline tw-uppercase tw-mb-8 ${textColor} ${className}`}>
            {children}
        </h2>
    )
}
