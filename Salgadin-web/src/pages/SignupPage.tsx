import { Check, Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Header } from "../components/Header";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PasswordStrength } from "../components/ui/PasswordStrength";
import { signupSchema, type SignupFormValues } from "../lib/schemas";
import { registerUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { AxiosError } from "axios";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const hasGoogleAuth = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const passwordValue = useWatch({ control, name: "password" });

  async function onSubmit(data: SignupFormValues) {
    setApiError(null);
    try {
      const { ...payload } = data;

      const { token } = await registerUser(payload);
      login(token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Falha no cadastro:", error);

      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      if (typeof detail === "string" && detail.trim()) {
        setApiError(detail);
      } else if (error instanceof AxiosError && error.response?.status === 400) {
        setApiError("Não foi possível criar a conta com esses dados. Confira os campos e tente de novo.");
      } else {
        setApiError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-y-scroll">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl min-h-[calc(100svh-80px)] grid items-center gap-10 px-4 py-8 lg:grid-cols-2">
          <section className="hidden flex-col items-start text-left lg:flex">
            <h1 className="max-w-md text-4xl font-medium text-foreground">
              Seus pequenos gastos, <span className="text-primary">finalmente à vista.</span>
            </h1>
            <ul className="mt-6 space-y-3 text-base text-foreground-muted">
              {[
                "Registre um café em dois segundos",
                "Saiba quanto ainda dá para gastar por dia",
                "Sem conectar a conta do banco",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Form Column */}
          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <header className="mb-6">
                <h2 className="text-2xl font-medium text-foreground">Crie sua conta</h2>
                <p className="mt-1 text-sm text-foreground-muted">
                  Grátis. Em seguida, montamos o seu mês em três passos.
                </p>
              </header>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <Input
                  label="Nome completo"
                  type="text"
                  placeholder="Seu nome"
                  icon={<User />}
                  error={errors.name}
                  {...register("name")}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  icon={<Mail />}
                  error={errors.username}
                  {...register("username")}
                />

                <div>
                  <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock />}
                    error={errors.password}
                    {...register("password")}
                  />
                  <PasswordStrength password={passwordValue} />
                </div>

                <Input
                  label="Confirme a senha"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock />}
                  error={errors.confirmPassword}
                  {...register("confirmPassword")}
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full mt-4"
                >
                  {isSubmitting ? "Criando conta..." : "Criar conta"}
                </Button>

                {apiError && (
                  <p role="alert" className="text-center text-ui text-danger">
                    {apiError}
                  </p>
                )}

                {hasGoogleAuth && (
                  <>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-foreground-muted font-medium">
                        ou continue com
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <GoogleAuthButton text="signup_with" />
                  </>
                )}
              </form>

              <p className="mt-5 text-center text-ui text-foreground-muted">
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-strong transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}


