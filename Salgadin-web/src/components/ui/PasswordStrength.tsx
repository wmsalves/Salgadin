import { CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

interface Rule {
  id: string;
  text: string;
  isValid: boolean;
}

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const rules: Rule[] = [
    {
      id: "length",
      text: "Pelo menos 8 caracteres",
      isValid: password.length >= 8,
    },
    {
      id: "uppercase",
      text: "Uma letra maiúscula",
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      text: "Uma letra minúscula",
      isValid: /[a-z]/.test(password),
    },
    {
      id: "number",
      text: "Pelo menos um número",
      isValid: /[0-9]/.test(password),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={clsx(
            "flex items-center transition-colors",
            rule.isValid ? "text-emerald-600" : "text-gray-500"
          )}
        >
          {rule.isValid ? (
            <CheckCircle2 size={12} className="mr-1.5" />
          ) : (
            <XCircle size={12} className="mr-1.5" />
          )}
          <span>{rule.text}</span>
        </div>
      ))}
    </div>
  );
}
