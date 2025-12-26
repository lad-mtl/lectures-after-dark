import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
        const baseClasses = 'relative inline-flex items-center justify-center font-headline font-semibold uppercase transition-all duration-300 ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border tracking-[0.1em] min-h-[48px] overflow-hidden group focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-midnight active:scale-[0.98]'

        const variantClasses = {
            primary: 'bg-gold text-midnight border-gold hover:bg-amber hover:border-amber hover:shadow-[0_8px_30px_rgba(204,153,102,0.4)] hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(204,153,102,0.2)]',
            secondary: 'bg-cream text-midnight border-cream hover:bg-transparent hover:text-cream hover:shadow-[0_8px_30px_rgba(245,240,232,0.2)] hover:-translate-y-0.5',
            outline: 'bg-transparent text-cream border-cream hover:bg-cream/10 hover:shadow-[0_8px_30px_rgba(245,240,232,0.15)] hover:border-gold hover:text-gold hover:-translate-y-0.5',
        }

        const sizeClasses = {
            sm: 'px-2 py-2 text-sm rounded',
            md: 'px-8 py-3 rounded-sm',
            lg: 'px-12 py-4 text-lg rounded-md',
        }

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
