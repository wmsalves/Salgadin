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
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
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
              "w-full rounded-xl border px-4 py-3 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500",
              icon && "pl-10",
              type === "password" && "pr-10"
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
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
      </div>
    );
  }
);
