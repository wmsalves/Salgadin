import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-emerald-600",
        secondary:
          "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500",
        ghost:
          "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        danger:
          "bg-red-500 text-white hover:bg-red-600 shadow-lg dark:bg-red-600 dark:hover:bg-red-700",
      },
      size: {
        default: "px-6 py-3 rounded-lg text-base",
        sm: "px-3 py-2 rounded-lg text-sm",
        lg: "px-8 py-4 rounded-lg text-lg",
        social: "px-4 py-2.5 rounded-lg text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant,
  size,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⚡</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
