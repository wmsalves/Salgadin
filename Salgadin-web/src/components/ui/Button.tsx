import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] font-semibold transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ui-pressable",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-[var(--color-on-primary)] shadow-lg hover:shadow-xl hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)]",
        secondary:
          "border border-border bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-2 hover:border-surface-3",
        ghost:
          "text-foreground-muted hover:text-foreground hover:bg-surface-2",
        danger:
          "bg-danger text-[#fffaf6] hover:bg-danger-strong shadow-lg",
      },
      size: {
        default: "px-6 py-3 text-base",
        sm: "min-h-10 px-3 py-2 text-sm",
        lg: "min-h-12 px-8 py-4 text-lg",
        social: "px-4 py-2.5 text-sm",
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
