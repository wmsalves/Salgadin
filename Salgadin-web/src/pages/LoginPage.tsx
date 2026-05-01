import { Mail, Lock, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import GoogleLogo from "../assets/google-icon-logo.svg";
import FacebookLogo from "../assets/facebook-icon-logo.svg";
import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { loginSchema, type LoginFormValues } from "../lib/schemas";
import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    setApiError(null);
    try {
      const response = await loginUser(data);
      login(response.token);
      navigate("/dashboard");
    } catch {
      setApiError("Email ou senha inválidos. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] flex flex-col overflow-y-scroll">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-border/70 bg-surface/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(60,42,32,0.12)] p-6 sm:p-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <header className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Bem vindo de volta!
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Acesse sua conta para continuar
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
              error={errors.username}
              {...register("username")}
            />

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm font-semibold text-foreground-muted">
                  Senha
                </label>
                <Link
                  to="/forgot"
                  className="text-sm text-primary hover:text-primary-strong font-medium transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                label=""
                type="password"
                placeholder="••••••••"
                icon={<Lock />}
                error={errors.password}
                {...register("password")}
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingIcon={<LogIn size={16} />}
              className="w-full mt-4"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            {apiError && (
              <div className="p-3 rounded-lg bg-surface-2 border border-danger/30">
                <p className="text-sm text-danger font-medium text-center">
                  {apiError}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-foreground-muted font-medium">
                ou continue com:
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                title="Entrar com Google"
              >
                <img
                  src={GoogleLogo}
                  alt="GoogleLogo"
                  className="h-4 w-4 mr-1"
                />
                <span className="text-xs">Google</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                title="Entrar com Facebook"
              >
                <img
                  src={FacebookLogo}
                  alt="FacebookLogo"
                  className="h-4 w-4 mr-1"
                />
                <span className="text-xs">Facebook</span>
              </Button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-foreground-muted">
            Não possui conta?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary-strong transition-colors"
            >
              Registre-se agora!
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

