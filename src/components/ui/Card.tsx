import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'bordered'
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>
type CardTitleProps = HTMLAttributes<HTMLHeadingElement>
type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>
type CardContentProps = HTMLAttributes<HTMLDivElement>
type CardFooterProps = HTMLAttributes<HTMLDivElement>

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', className = '', children, ...props }, ref) => {
        const baseClasses = 'rounded-lg transition-all duration-300 ease-out overflow-hidden group'

        const variantClasses = {
            default: 'bg-card-bg border border-cream/10 hover:border-gold/30',
            elevated: 'bg-card-bg shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(204,153,102,0.2)] hover:-translate-y-1',
            bordered: 'bg-midnight border-2 border-gold/20 hover:border-gold hover:shadow-[0_4px_20px_rgba(204,153,102,0.2)]',
        }

        return (
            <div
                ref={ref}
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                {...props}
            >
                {children}
            </div>
        )
    }
)

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className = '', ...props }, ref) => (
        <div ref={ref} className={`p-3 ${className}`} {...props} />
    )
)

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className = '', ...props }, ref) => (
        <h3
            ref={ref}
            className={`font-headline text-lg text-amber uppercase tracking-wider mb-2 ${className}`}
            {...props}
        />
    )
)

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className = '', ...props }, ref) => (
        <p
            ref={ref}
            className={`font-body text-cream-dark leading-relaxed ${className}`}
            {...props}
        />
    )
)

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className = '', ...props }, ref) => (
        <div ref={ref} className={`px-6 pt-2 pb-4 ${className}`} {...props} />
    )
)

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className = '', ...props }, ref) => (
        <div
            ref={ref}
            className={`px-6 py-4 border-t border-cream/10 bg-midnight/30 ${className}`}
            {...props}
        />
    )
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
