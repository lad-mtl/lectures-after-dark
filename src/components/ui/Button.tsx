import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
        const baseClasses = 'tw:rounded tw:font-semibold tw:uppercase tw:transition-all tw:duration-200 tw:cursor-pointer disabled:tw:opacity-50 disabled:tw:cursor-not-allowed'

        const variantClasses = {
            primary: 'tw:bg-amber tw:text-white hover:tw:bg-amber-light hover:tw:shadow-lg',
            secondary: 'tw:bg-white tw:text-midnight hover:tw:bg-cream hover:tw:shadow-md',
            outline: 'tw:border-2 tw:border-amber tw:text-amber tw:bg-transparent hover:tw:bg-amber hover:tw:text-white',
        }

        const sizeClasses = {
            sm: 'tw:px-4 tw:py-2 tw:text-sm',
            md: 'tw:px-8 tw:py-4 tw:text-base',
            lg: 'tw:px-10 tw:py-5 tw:text-lg',
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
