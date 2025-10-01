import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="mt-6 bg-gradient-to-tr from-amber-200 via-emerald-100 to-emerald-200">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <h3 className="text-2xl font-extrabold text-emerald-700">
          Comece a transformar suas finanças hoje
        </h3>
        <p className="mt-2 text-gray-700 max-w-2xl mx-auto text-sm sm:text-base">
          Junte-se a milhares de pessoas que já estão economizando e alcançando
          seus objetivos financeiros com o Salgadin.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 shadow"
          >
            Criar conta grátis
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-black/10 px-5 py-2.5 hover:bg-black/5"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </section>
  );
}
