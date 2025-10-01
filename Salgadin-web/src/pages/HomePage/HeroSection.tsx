import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-10">
      <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-emerald-600">
        Gerencie suas finanças com
        <br className="hidden sm:block" />
        <span className="text-emerald-700"> simplicidade e eficiência</span>
      </h1>
      <p className="mt-4 text-center max-w-2xl mx-auto text-sm sm:text-base text-gray-600">
        O Salgadin é a plataforma completa para controle de custos e despesas
        que vai transformar sua vida financeira. Organize, planeje e economize
        com facilidade.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/signup"
          className="rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-4 sm:px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-95"
        >
          Começar Gratuitamente
        </Link>
        <a
          href="#how"
          className="rounded-full border border-black/10 px-4 sm:px-5 py-2.5 text-sm font-medium hover:bg-black/5"
        >
          Ver como funciona
        </a>
      </div>

      {/* Gráfico placeholder */}
      <div className="relative mt-10">
        <div className="mx-auto h-[360px] w-full max-w-5xl rounded-2xl border border-black/10 bg-white shadow-inner grid place-items-center text-gray-400">
          <span className="text-sm">(Gráfico)</span>
        </div>

        {/* Badges */}
        <div className="absolute -right-2 -top-3 rotate-2">
          <div className="rounded-xl border bg-white shadow px-3 py-1.5 text-[11px]">
            <div className="font-semibold text-emerald-600">
              Economia do mês
            </div>
            <div className="font-bold">R$ 1.250,00</div>
          </div>
        </div>
        <div className="absolute -left-2 -bottom-4 -rotate-2">
          <div className="rounded-xl border bg-white shadow px-3 py-1.5 text-[11px]">
            <div className="font-semibold text-amber-600">Metas do mês</div>
            <div className="font-bold">3 de 5</div>
          </div>
        </div>
      </div>
    </section>
  );
}
