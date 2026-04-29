import {
  type ComponentProps,
  forwardRef,
  type ReactNode,
  useState,
  isValidElement,
  cloneElement,
  type ReactElement,
} from "react";
import type { FieldError } from "react-hook-form";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  icon?: ReactNode;
  error?: FieldError;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, name, type, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputType = type === "password" && isPasswordVisible ? "text" : type;

    return (
      <div>
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-foreground-muted mb-2"
        >
          {label}
          {error && <span className="text-danger ml-1">*</span>}
        </label>
        <div className="relative mt-1">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isValidElement(icon) &&
                cloneElement(icon as ReactElement<{ className: string }>, {
                  className: "h-5 w-5 text-foreground-subtle",
                })}
            </div>
          )}

          <input
            id={name}
            name={name}
            type={inputType}
            ref={ref}
            className={clsx(
              "w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 ui-input",
              "focus:ring-2 focus:ring-primary/40 focus:border-primary focus:shadow-lg focus:shadow-[rgba(var(--shadow-color),0.12)]",
              "placeholder:text-foreground-subtle",
              icon && "pl-10",
              type === "password" && "pr-10",
              error && "border-danger focus:ring-danger focus:border-danger",
            )}
            {...props}
          />

          {type === "password" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="grid h-9 w-9 place-items-center rounded-xl text-foreground-subtle hover:bg-surface-2 hover:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={
                  isPasswordVisible ? "Esconder senha" : "Mostrar senha"
                }
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-danger font-medium">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);
