import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Assets
import LogoSalgadin from "../assets/Logo_Salgadin.svg";
import GoogleLogo from "../assets/google-icon-logo.svg";
import FacebookLogo from "../assets/facebook-icon-logo.svg";

// Components & Schemas
import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { loginSchema, type LoginFormValues } from "../lib/schemas";

export default function LoginPage() {
  // 1. Configuração do React Hook Form com o schema de validação do Zod.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 2. Função assíncrona para lidar com a submissão do formulário.
  async function onSubmit(data: LoginFormValues) {
    // A validação já foi feita automaticamente pelo handleSubmit.
    console.log("Dados de login válidos:", data);

    // Simula o tempo de uma chamada de API.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Integrar com o serviço da API de login.
    alert("Login efetuado com sucesso! (simulação)");
  }

  return (
    <div className="min-h-screen bg-[#fff8e6] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="flex items-center gap-3 -mt-6 mb-6">
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

          {/* 3. O formulário agora usa handleSubmit para envolver nossa função onSubmit. */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            {/* 4. O componente reutilizável 'Input'. */}
            <Input
              label="Email"
              id="username"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
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
                autoComplete="current-password"
                icon={<Lock />}
                error={errors.password}
                {...register("password")}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting} // 5. O botão é desabilitado durante o envio.
              className="w-full rounded-xl px-4 py-3 font-semibold text-white shadow
                         bg-gradient-to-r from-amber-400 to-emerald-400 hover:opacity-95
                         transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs text-gray-600">ou continue com:</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-xl border px-4 py-2.5 hover:bg-black/5 transition flex items-center justify-center gap-2"
                title="Entrar com Google"
              >
                <img src={GoogleLogo} alt="GoogleLogo" className="h-6 w-6" />
                <span className="font-medium">Google</span>
              </button>
              <button
                type="button"
                className="rounded-xl border px-4 py-2.5 hover:bg-black/5 transition flex items-center justify-center gap-2"
                title="Entrar com Facebook"
              >
                <img
                  src={FacebookLogo}
                  alt="FacebookLogo"
                  className="h-7 w-7"
                />
                <span className="font-medium">Facebook</span>
              </button>
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
