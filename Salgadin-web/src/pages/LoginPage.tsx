import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";

export default function LoginPage() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: integrar com API
  }

  return (
    <main className="min-h-svh bg-[#fff8e6] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-3 -mt-6 mb-6">
        <img src={LogoSalgadin} alt="Salgadin" className="h-28 w-28" />
        {/* opcional: título ao lado do logo, se quiser remover basta tirar este span */}
        <span className="text-4xl font-extrabold tracking-tight">
          <span className="text-amber-600">Salgad</span>
          <span className="text-emerald-600">in</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/80 backdrop-blur shadow p-6 sm:p-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            Bem vindo de volta!
          </h1>
          <p className="mt-1 text-gray-600">Acesse sua conta para continuar</p>
        </header>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <div className="relative mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue="teste@teste.com"
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

          {/* Senha + esqueceu */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Link
                to="/forgot"
                className="text-sm text-amber-600 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                defaultValue="************"
                className="w-full rounded-xl border px-4 py-3 pr-10 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <Lock
                aria-hidden
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
              />
            </div>
          </div>

          {/* Entrar */}
          <button
            type="submit"
            className="w-full rounded-xl px-4 py-3 font-semibold text-white shadow
                       bg-gradient-to-r from-amber-400 to-emerald-400 hover:opacity-95 transition"
          >
            Entrar
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-gray-600">ou continue com:</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-xl border px-4 py-2.5 hover:bg-black/5 transition flex items-center justify-center gap-2"
              title="Entrar com Google"
            >
              {/* bolinha Google simples */}
              <span className="inline-block h-5 w-5 rounded-full border" />
              <span className="font-medium">Google</span>
            </button>
            <button
              type="button"
              className="rounded-xl border px-4 py-2.5 hover:bg-black/5 transition flex items-center justify-center gap-2"
              title="Entrar com Facebook"
            >
              <span className="inline-block h-5 w-5 rounded-full border" />
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
  );
}
