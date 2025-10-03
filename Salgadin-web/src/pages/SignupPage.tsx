/* eslint-disable @typescript-eslint/no-unused-vars */
import { Mail, Lock } from "lucide-react"; // Make sure Lock is imported
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

// Assets, Components & Schemas
import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PasswordStrength } from "../components/ui/PasswordStrength";
import { signupSchema, type SignupFormValues } from "../lib/schemas";

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
      console.log("Enviando para a API:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Cadastro efetuado! Redirecionando...");
      navigate("/dashboard");
    } catch (error) {
      setApiError("Este nome de usuário já está em uso. Tente outro.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8e6] flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl min-h-[calc(100svh-80px)] grid gap-12 md:grid-cols-2 items-center px-4 py-8">
          {/* Branding Column */}
          <section className="hidden md:flex flex-col items-start text-left">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              <span className="text-emerald-700">Transforme suas</span>
              <br />
              <span className="text-amber-600">finanças com estilo</span>
            </h1>
            <p className="mt-4 max-w-md text-gray-700">
              Gerencie despesas, acompanhe investimentos e alcance seus
              objetivos financeiros com nossa plataforma intuitiva.
            </p>
          </section>

          {/* Form Column */}
          <section className="flex justify-center md:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow p-6 sm:p-8">
              <header className="text-center md:text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold">
                  Crie sua Conta
                </h2>
                <p className="text-gray-600">Preencha os dados para começar.</p>
              </header>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 space-y-4"
                noValidate
              >
                <Input
                  label="Email"
                  id="username"
                  type="email"
                  placeholder="seu@email.com"
                  icon={<Mail />}
                  error={errors.username}
                  {...register("username")}
                />

                <div>
                  <Input
                    label="Senha"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock />} // CORREÇÃO: Ícone adicionado
                    error={errors.password}
                    {...register("password")}
                  />
                  <PasswordStrength password={passwordValue} />
                </div>

                <Input
                  label="Confirme sua Senha"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock />} // CORREÇÃO: Ícone adicionado
                  error={errors.confirmPassword}
                  {...register("confirmPassword")}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Criando conta..." : "Criar Conta"}
                </Button>

                {apiError && (
                  <p className="text-sm text-red-600 text-center pt-2">
                    {apiError}
                  </p>
                )}
              </form>

              <p className="mt-6 text-center text-sm">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-amber-600 hover:underline">
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
