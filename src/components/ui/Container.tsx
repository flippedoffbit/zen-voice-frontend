import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Container ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={ twMerge('container mx-auto px-4', className) } { ...props }>
            { children }
        </div>
    );
}
