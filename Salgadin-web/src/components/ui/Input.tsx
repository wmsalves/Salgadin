import {
  type ComponentProps,
  forwardRef,
  type ReactNode,
  useState,
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
    // 1. Estado para controlar a visibilidade da senha
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // 2. Determina o tipo do input (se é senha, permite alternar)
    const inputType = type === "password" && isPasswordVisible ? "text" : type;

    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
        </label>
        <div className="relative mt-1">
          <input
            id={name}
            name={name}
            type={inputType}
            ref={ref}
            className={clsx(
              "w-full rounded-xl border px-4 py-3 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500",
              // Adiciona padding extra à direita se for um campo de senha para dar espaço ao ícone
              type === "password" ? "pr-12" : "pr-10"
            )}
            {...props}
          />
          {/* 3. Renderiza o ícone principal ou o alternador de visibilidade */}
          <div
            aria-hidden
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center"
          >
            {type === "password" ? (
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={
                  isPasswordVisible ? "Esconder senha" : "Mostrar senha"
                }
              >
                {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            ) : (
              icon && <span className="h-4 w-4 text-gray-500">{icon}</span>
            )}
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
      </div>
    );
  }
);
