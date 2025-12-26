import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
        const baseClasses = 'rounded font-semibold uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

        const variantClasses = {
            primary: 'bg-amber text-white hover:bg-amber-light hover:shadow-lg',
            secondary: 'bg-white text-midnight hover:bg-cream hover:shadow-md',
            outline: 'border-2 border-amber text-amber bg-transparent hover:bg-amber hover:text-white',
        }

        const sizeClasses = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-8 py-4 text-base',
            lg: 'px-10 py-5 text-lg',
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
