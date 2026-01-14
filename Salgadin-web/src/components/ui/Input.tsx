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
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          {label}
          {error && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative mt-1">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isValidElement(icon) &&
                cloneElement(icon as ReactElement<{ className: string }>, {
                  className: "h-5 w-5 text-gray-500",
                })}
            </div>
          )}

          <input
            id={name}
            name={name}
            type={inputType}
            ref={ref}
            className={clsx(
              "w-full rounded-lg border border-slate-200 px-4 py-3 bg-white outline-none transition-all duration-200",
              "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 focus:shadow-lg focus:shadow-emerald-100",
              "placeholder:text-slate-400",
              icon && "pl-10",
              type === "password" && "pr-10",
              error && "border-red-300 focus:ring-red-500 focus:shadow-red-100"
            )}
            {...props}
          />

          {type === "password" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="text-gray-500 hover:text-gray-700"
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
          <p className="mt-2 text-sm text-red-600 font-medium">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);
