import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-9 w-full rounded-md border border-white/[0.08] bg-[#0e1016] px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };
