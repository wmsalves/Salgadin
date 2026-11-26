import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] font-medium transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ui-pressable motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-[var(--color-on-primary)] hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)]",
        secondary:
          "border border-border bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-2 hover:border-surface-3",
        ghost:
          "text-foreground-muted hover:text-foreground hover:bg-surface-2",
        danger:
          "bg-danger text-[#fffaf6] hover:bg-danger-strong",
      },
      size: {
        default: "px-6 py-3 text-sm",
        sm: "min-h-10 px-3 py-2 text-ui",
        lg: "min-h-12 px-7 py-3.5 text-base",
        social: "px-4 py-2.5 text-ui",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingIcon?: ReactNode;
}

export function Button({
  children,
  className,
  variant,
  size,
  isLoading = false,
  loadingIcon,
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
          <span className="mr-2 inline-flex items-center">
            {loadingIcon ?? <Loader2 size={16} className="animate-spin" />}
          </span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
