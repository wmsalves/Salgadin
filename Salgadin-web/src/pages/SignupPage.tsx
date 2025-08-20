import { Mail, Lock, Phone, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";

export default function SignupPage() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: integrar com API
  }

  return (
    <main className="bg-[#fff8e6]">
      <div className="mx-auto max-w-6xl min-h-svh grid gap-12 md:grid-cols-2 items-center px-4 py-8 md:py-0">
        {/* ESQUERDA */}
        <section className="flex flex-col items-center md:items-start text-center md:text-left">
          <img src={LogoSalgadin} alt="Salgadin" className="h-28 w-28 mb-6" />

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            <span className="text-emerald-700">Transforme suas</span>
            <br />
            <span className="text-amber-600">finanças com estilo</span>
          </h1>

          <p className="mt-4 max-w-md text-gray-700">
            Gerencie despesas, acompanhe investimentos e alcance seus objetivos
            financeiros com nossa plataforma intuitiva.
          </p>

          <div className="mt-8 grid w-full max-w-sm gap-3">
            <span className="inline-block rounded-full border px-4 py-2 text-emerald-600 border-emerald-600/30">
              Controle de despesas
            </span>
            <span className="inline-block rounded-full border px-4 py-2 text-amber-600 border-black/10">
              Relatórios detalhados
            </span>
            <span className="inline-block rounded-full border px-4 py-2 text-emerald-600 border-emerald-600/30">
              Planejamento financeiro
            </span>
            <span className="inline-block rounded-full border px-4 py-2 text-amber-600 border-black/10">
              E muito mais
            </span>
          </div>
        </section>

        {/* DIREITA */}
        <section className="flex justify-center md:justify-end">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow p-6 sm:p-8">
            <header className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                Crie sua Conta
              </h2>
              <p className="text-left text-gray-600">
                Preencha seus dados pessoais
              </p>
            </header>

            <form
              onSubmit={onSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
              noValidate
            >
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Nome Completo
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                  <User
                    aria-hidden
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Telefone
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    required
                    inputMode="tel"
                    className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                  />
                  <Phone
                    aria-hidden
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                  <Mail
                    aria-hidden
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  />
                </div>
              </div>

              {/* Confirmar email */}
              <div>
                <label
                  htmlFor="confirmEmail"
                  className="block text-sm font-medium"
                >
                  Confirme o email
                </label>
                <div className="relative">
                  <input
                    id="confirmEmail"
                    name="confirmEmail"
                    type="email"
                    required
                    className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="repita seu email"
                    autoComplete="email"
                  />
                  <Mail
                    aria-hidden
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <Lock
                    aria-hidden
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  />
                </div>
              </div>

              {/* Confirmar senha */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium"
                >
                  Confirme sua senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="repita a senha"
                    autoComplete="new-password"
                  />
                  <Lock
                    aria-hidden
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="md:col-span-2 mt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl px-4 py-3 font-semibold text-white shadow
                             bg-gradient-to-r from-amber-400 to-emerald-400 hover:opacity-95 transition"
                >
                  Registrar-se !
                </button>

                <button
                  type="button"
                  className="rounded-xl border px-4 py-3 hover:bg-black/5 transition"
                  title="Continuar"
                  aria-label="Continuar"
                >
                  <ArrowRight />
                </button>
              </div>
            </form>

            <p className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-amber-600 hover:underline">
                Faça o login!
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
