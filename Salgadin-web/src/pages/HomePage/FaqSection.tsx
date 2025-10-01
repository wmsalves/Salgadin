import { faqItems } from "./content";

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
        Perguntas Frequentes
      </h2>
      <p className="mt-2 text-center text-gray-600 text-sm sm:text-base">
        Encontre respostas para as dúvidas mais comuns sobre o Salgadin.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {faqItems.map((item) => (
          <div
            key={item.q}
            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="font-medium">{item.q}</div>
            <p className="mt-1 text-sm text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
