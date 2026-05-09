import { Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { AxiosError } from "axios";

import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../lib/schemas";
import { forgotPassword } from "../services/authService";

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPassword(data);
      setSuccessMessage(response.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string" && detail.trim()) {
          setApiError(detail);
          return;
        }
      }

      setApiError("Não foi possível iniciar a recuperação agora. Tente novamente mais tarde.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] flex flex-col overflow-y-scroll">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-border/70 bg-surface/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(60,42,32,0.12)] p-6 sm:p-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <header className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Recuperar acesso
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Informe seu email para receber as instruções de redefinição.
            </p>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail />}
              error={errors.email}
              {...register("email")}
            />

            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingIcon={<Send size={16} />}
              className="w-full"
            >
              {isSubmitting ? "Enviando..." : "Enviar instruções"}
            </Button>

            {successMessage && (
              <div className="rounded-2xl border border-success/25 bg-success/10 px-4 py-3">
                <p className="text-sm font-medium text-success">
                  {successMessage}
                </p>
                {import.meta.env.DEV && (
                  <p className="mt-2 text-xs text-foreground-muted">
                    Em desenvolvimento local, confira os logs da API para obter o
                    link de redefinição.
                  </p>
                )}
              </div>
            )}

            {apiError && (
              <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3">
                <p className="text-sm font-medium text-danger">{apiError}</p>
              </div>
            )}
          </form>

          <p className="mt-5 text-center text-sm text-foreground-muted">
            Lembrou a senha?{" "}
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
