import React from 'react'

interface ParagraphProps {
    children: React.ReactNode
    className?: string
    maxWidth?: 'prose' | 'full' | 'narrow'
}

export default function Paragraph({
    children,
    className = '',
    maxWidth = 'full'
}: ParagraphProps) {
    const widthClasses = {
        prose: 'tw-max-w-prose', // ~65ch - optimal readability
        narrow: 'tw-max-w-2xl',
        full: 'tw-max-w-full',
    }

    return (
        <p className={`tw-text-base tw-leading-relaxed ${widthClasses[maxWidth]} ${className}`}>
            {children}
        </p>
    )
}
