import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-amber-400 to-emerald-400 text-white shadow hover:opacity-95",
        secondary: "border bg-transparent hover:bg-black/5",
      },
      size: {
        default: "px-4 py-3 rounded-xl",
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
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
