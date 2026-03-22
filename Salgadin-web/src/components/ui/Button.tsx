import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-white shadow-lg hover:shadow-xl hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)]",
        secondary:
          "border border-border bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-2 hover:border-surface-3",
        ghost:
          "text-foreground-muted hover:text-foreground hover:bg-surface-2",
        danger:
          "bg-danger text-white hover:bg-danger-strong shadow-lg",
      },
      size: {
        default: "px-6 py-3 rounded-xl text-base",
        sm: "px-3 py-2 rounded-xl text-sm",
        lg: "px-8 py-4 rounded-2xl text-lg",
        social: "px-4 py-2.5 rounded-xl text-sm",
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
