import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Assets, Components & Schemas
import LogoSalgadin from "../assets/Logo_Salgadin.svg";
import GoogleLogo from "../assets/google-icon-logo.svg";
import FacebookLogo from "../assets/facebook-icon-logo.svg";
import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button"; // Importar o novo botão
import { loginSchema, type LoginFormValues } from "../lib/schemas";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    console.log("Dados de login válidos:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert("Login efetuado com sucesso! (simulação)");
  }

  return (
    <div className="min-h-screen bg-[#fff8e6] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <img src={LogoSalgadin} alt="Salgadin" className="h-28 w-28" />
          <span className="text-4xl font-extrabold tracking-tight">
            <span className="text-amber-600">Salgad</span>
            <span className="text-emerald-600">in</span>
          </span>
        </div>

        <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow p-6 sm:p-8">
          <header className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              Bem vindo de volta!
            </h1>
            <p className="mt-1 text-gray-600">
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
              id="username"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail />}
              error={errors.username}
              {...register("username")}
            />

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Senha</span>
                <Link
                  to="/forgot"
                  className="text-sm text-amber-600 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                label=""
                id="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock />}
                error={errors.password}
                {...register("password")}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs text-gray-600">ou continue com:</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="social"
                title="Entrar com Google"
              >
                <img
                  src={GoogleLogo}
                  alt="GoogleLogo"
                  className="h-6 w-6 mr-2"
                />
                <span className="font-medium">Google</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="social"
                title="Entrar com Facebook"
              >
                <img
                  src={FacebookLogo}
                  alt="FacebookLogo"
                  className="h-7 w-7 mr-2"
                />
                <span className="font-medium">Facebook</span>
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm">
            Não possui conta?{" "}
            <Link to="/signup" className="text-amber-600 hover:underline">
              Registre-se agora!
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
