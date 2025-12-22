import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const { disabled: propsDisabled, ...rest } = props as any;
    const disabledState = !!isLoading || !!propsDisabled;

    const variants: Record<string, string> = {
      primary: 'bg-primary text-white hover:bg-primary-dark',
      secondary: 'bg-accent-light text-accent hover:bg-accent-muted',
      outline: 'border border-border text-text-primary hover:bg-background',
      ghost: 'text-text-secondary hover:bg-background hover:text-primary',
      gradient: 'btn-primary-gradient',
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    return (
      <button
        ref={ ref }
        className={ twMerge(
          'inline-flex items-center justify-center rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[ variant ] ?? variants.primary,
          sizes[ size ] ?? sizes.md,
          className
        ) }
        disabled={ disabledState }
        { ...rest }
      >
        { isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null }
        { children }
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
