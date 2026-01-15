import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PasswordStrength } from "../components/ui/PasswordStrength";
import { signupSchema, type SignupFormValues } from "../lib/schemas";
import { registerUser } from "../services/authService";
import { AxiosError } from "axios";

export default function SignupPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

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

      await registerUser(payload);

      alert(
        "Cadastro realizado com sucesso! Você será redirecionado para o login."
      );

      navigate("/login");
    } catch (error) {
      console.error("Falha no cadastro:", error);

      if (error instanceof AxiosError && error.response?.status === 400) {
        setApiError("Este email já está em uso. Tente outro ou faça login.");
      } else {
        setApiError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex flex-col overflow-y-scroll">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl min-h-[calc(100svh-80px)] grid gap-6 md:gap-8 md:grid-cols-2 items-center px-4 py-6 md:py-4">
          {/* Branding Column - Hidden on smaller resolutions */}
          <section className="hidden lg:flex flex-col items-start text-left">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                  Transforme suas
                </span>
                <br />
                <span className="text-slate-800">finanças</span>
              </h1>
              <p className="max-w-sm text-base text-slate-600 leading-relaxed">
                Gerencie despesas, acompanhe investimentos e alcance seus
                objetivos financeiros.
              </p>
            </div>
          </section>

          {/* Form Column */}
          <section className="flex justify-center md:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-6 sm:p-8">
              <header className="text-center md:text-left mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Crie sua Conta
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Preencha os dados para começar.
                </p>
              </header>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
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
                  label="Confirme sua Senha"
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
                  {isSubmitting ? "Criando conta..." : "Criar Conta"}
                </Button>

                {apiError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700 font-medium text-center">
                      {apiError}
                    </p>
                  </div>
                )}
              </form>

              <p className="mt-4 text-center text-xs text-slate-600">
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Faça o login!
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
