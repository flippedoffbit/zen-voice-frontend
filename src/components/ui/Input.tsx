import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                { label && (
                    <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">
                        { label }
                    </label>
                ) }
                <input
                    ref={ ref }
                    className={ twMerge(
                        "w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                        error && "border-error focus:ring-error/20 focus:border-error",
                        className
                    ) }
                    { ...props }
                />
                { error && (
                    <p className="mt-1.5 text-xs text-error ml-1">{ error }</p>
                ) }
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
