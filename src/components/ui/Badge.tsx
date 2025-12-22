import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
}

export default function Badge ({ className, variant = 'primary', children, ...props }: BadgeProps) {
    const variants = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-accent/10 text-accent',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
        outline: 'border border-border text-text-secondary',
    };

    return (
        <span
            className={ twMerge(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                variants[ variant ],
                className
            ) }
            { ...props }
        >
            { children }
        </span>
    );
}
