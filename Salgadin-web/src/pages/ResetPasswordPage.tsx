import { AxiosError } from "axios";
import { Lock, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PasswordStrength } from "../components/ui/PasswordStrength";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../lib/schemas";
import { resetPassword } from "../services/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    setValue("token", token, { shouldValidate: true });
  }, [setValue, token]);

  async function onSubmit(data: ResetPasswordFormValues) {
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await resetPassword(data);
      setSuccessMessage(response.message);
      setTimeout(() => navigate("/login"), 2200);
    } catch (error) {
      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string" && detail.trim()) {
          setApiError(detail);
          return;
        }
      }

      setApiError("Não foi possível redefinir sua senha agora. Tente novamente mais tarde.");
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] flex flex-col overflow-y-scroll">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md rounded-3xl border border-border/70 bg-surface/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(60,42,32,0.12)] p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-foreground">
              Link inválido
            </h1>
            <p className="mt-2 text-sm text-foreground-muted">
              O link de redefinição está incompleto ou inválido. Solicite um novo link para continuar.
            </p>
            <Link
              to="/forgot-password"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] shadow-[0_10px_24px_rgba(60,42,32,0.14)] ui-pressable"
            >
              Solicitar novo link
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] flex flex-col overflow-y-scroll">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-border/70 bg-surface/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(60,42,32,0.12)] p-6 sm:p-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <header className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Redefinir senha
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Escolha uma nova senha para voltar a acessar sua conta.
            </p>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            <input type="hidden" {...register("token")} />

            <div>
              <Input
                label="Nova senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock />}
                error={errors.newPassword}
                {...register("newPassword")}
              />
              <PasswordStrength password={watch("newPassword")} />
            </div>

            <Input
              label="Confirme a nova senha"
              type="password"
              placeholder="••••••••"
              icon={<Lock />}
              error={errors.confirmNewPassword}
              {...register("confirmNewPassword")}
            />

            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingIcon={<LogIn size={16} />}
              className="w-full"
            >
              {isSubmitting ? "Redefinindo..." : "Salvar nova senha"}
            </Button>

            {successMessage && (
              <div className="rounded-2xl border border-success/25 bg-success/10 px-4 py-3">
                <p className="text-sm font-medium text-success">
                  {successMessage}
                </p>
              </div>
            )}

            {apiError && (
              <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3">
                <p className="text-sm font-medium text-danger">{apiError}</p>
              </div>
            )}
          </form>

          <p className="mt-5 text-center text-sm text-foreground-muted">
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-strong transition-colors"
            >
              Voltar para o login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
