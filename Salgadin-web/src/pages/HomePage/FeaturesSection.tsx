import { features } from "./content";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
        Tudo o que você precisa para gerenciar
        <br className="hidden sm:block" /> suas finanças
      </h2>
      <p className="mt-3 text-center max-w-3xl mx-auto text-gray-600 text-sm sm:text-base">
        O Salgadin oferece ferramentas poderosas e intuitivas para ajudar você a
        controlar seus gastos, economizar dinheiro e alcançar seus objetivos
        financeiros.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 grid place-items-center rounded-full">
                <img src={f.icon} alt={f.title} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
