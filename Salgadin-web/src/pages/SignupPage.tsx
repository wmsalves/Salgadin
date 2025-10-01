import { Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Components & Schemas
import { Header } from "../components/Header";
import { Input } from "../components/ui/Input";
import { signupSchema, type SignupFormValues } from "../lib/schemas";

export default function SignupPage() {
  // 1. Configuração do React Hook Form com o schema de cadastro.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  // 2. Função para lidar com a submissão do formulário de cadastro.
  async function onSubmit(data: SignupFormValues) {
    // A validação, incluindo a confirmação de senha, já foi feita.
    console.log("Dados de cadastro válidos:", data);

    // Simula o tempo de uma chamada de API.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Integrar com o serviço da API de registro.
    alert("Cadastro efetuado com sucesso! (simulação)");
  }

  return (
    <div className="min-h-screen bg-[#fff8e6] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow p-6 sm:p-8">
          <header className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              Crie sua conta
            </h1>
            <p className="mt-1 text-gray-600">
              Comece a organizar suas finanças hoje mesmo.
            </p>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            <Input
              label="Nome de Usuário"
              id="username"
              placeholder="Ex: seu_usuario"
              autoComplete="username"
              icon={<User />}
              error={errors.username}
              {...register("username")}
            />

            <Input
              label="Senha"
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<Lock />}
              error={errors.password}
              {...register("password")}
            />

            <Input
              label="Confirme sua Senha"
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<Lock />}
              error={errors.confirmPassword}
              {...register("confirmPassword")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl px-4 py-3 font-semibold text-white shadow
                         bg-gradient-to-r from-amber-400 to-emerald-400 hover:opacity-95
                         transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Já possui conta?{" "}
            <Link to="/login" className="text-amber-600 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
