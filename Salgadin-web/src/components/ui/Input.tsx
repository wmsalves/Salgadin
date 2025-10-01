import { type ComponentProps, forwardRef, type ReactNode } from "react";
import type { FieldError } from "react-hook-form";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  icon?: ReactNode;
  error?: FieldError;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, name, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
        </label>
        <div className="relative mt-1">
          <input
            id={name}
            name={name}
            ref={ref}
            className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
            {...props}
          />
          {icon && (
            <div
              aria-hidden
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
            >
              {icon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
      </div>
    );
  }
);
