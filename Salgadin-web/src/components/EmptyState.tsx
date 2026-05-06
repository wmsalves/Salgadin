import type { ComponentType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";

type EmptyStateAction = {
  label: string;
  onClick?: () => void;
  href?: string;
};

interface EmptyStateProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
  size?: "default" | "spacious";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  className,
  compact = false,
  size = "default",
}: EmptyStateProps) {
  const isSpacious = size === "spacious";

  const renderAction = (
    action: EmptyStateAction,
    variant: "primary" | "secondary",
  ) => {
    const classes = clsx(
      "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      isSpacious ? "px-5 py-2.5" : "px-4 py-2",
      variant === "primary"
        ? "bg-primary text-white shadow-[0_10px_24px_rgba(242,139,91,0.22)] hover:bg-primary-strong"
        : "border border-border bg-surface-2 text-foreground hover:bg-surface-3",
    );

    if (action.href) {
      return (
        <Link to={action.href} className={classes}>
          {action.label}
          {variant === "primary" && <ArrowRight size={15} />}
        </Link>
      );
    }

    return (
      <button type="button" onClick={action.onClick} className={classes}>
        {action.label}
        {variant === "primary" && <ArrowRight size={15} />}
      </button>
    );
  };

  return (
    <div
      className={clsx(
        "rounded-3xl border border-dashed border-primary/24 bg-gradient-to-br from-surface/92 via-surface/84 to-surface-2/72 text-center shadow-[0_14px_30px_rgba(60,42,32,0.08)]",
        isSpacious
          ? "px-6 py-10 sm:px-10 sm:py-12"
          : compact
            ? "px-5 py-6"
            : "px-6 py-8",
        className,
      )}
    >
      <div
        className={clsx(
          "mx-auto grid place-items-center rounded-2xl border border-primary/18 bg-primary/10 text-primary",
          isSpacious ? "h-16 w-16" : "h-12 w-12",
        )}
      >
        <Icon size={isSpacious ? 30 : 22} />
      </div>
      <h3
        className={clsx(
          "font-semibold text-foreground",
          isSpacious ? "mt-5 text-lg sm:text-xl" : "mt-4 text-base",
        )}
      >
        {title}
      </h3>
      <p
        className={clsx(
          "mx-auto mt-2 text-foreground-muted",
          isSpacious
            ? "max-w-xl text-sm leading-6 sm:text-base sm:leading-7"
            : "max-w-md text-sm leading-6",
        )}
      >
        {description}
      </p>
      {children && <div className="mt-5">{children}</div>}
      {(primaryAction || secondaryAction) && (
        <div
          className={clsx(
            "flex flex-col items-center justify-center sm:flex-row",
            isSpacious ? "mt-6 gap-3" : "mt-5 gap-2",
          )}
        >
          {primaryAction && renderAction(primaryAction, "primary")}
          {secondaryAction && renderAction(secondaryAction, "secondary")}
        </div>
      )}
    </div>
  );
}
