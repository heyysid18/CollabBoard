import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98]",
                secondary: "bg-white/[0.05] text-slate-200 hover:bg-white/[0.1] border border-white/[0.05] active:scale-[0.98]",
                ghost: "hover:bg-white/[0.05] text-slate-400 hover:text-slate-100",
                danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20",
                outline: "border border-white/[0.1] bg-transparent hover:bg-white/[0.05] text-slate-300"
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9"
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "default"
        }
    }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = "Button";

export { Button, buttonVariants };
