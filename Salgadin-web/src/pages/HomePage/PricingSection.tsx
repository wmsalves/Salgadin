import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = {
    free: {
      name: "Grátis",
      price: "R$ 0",
      description: "Para quem está começando a organizar os gastos diários.",
      features: [
        "Cadastro de despesas ilimitado",
        "Até 5 categorias personalizadas",
        "Criação de 1 meta financeira",
        "Acesso ao dashboard mensal",
      ],
    },
    pro: {
      name: "Pro",
      price: billingCycle === "monthly" ? "R$ 9,90" : "R$ 99",
      priceSuffix: billingCycle === "monthly" ? "/mês" : "/ano",
      description: "Para quem busca controle total e insights inteligentes.",
      features: [
        "Tudo do plano Grátis, sem limites",
        "Orçamentos com alertas",
        "Relatórios avançados e exportação",
        "Histórico de despesas completo",
        "Suporte prioritário",
      ],
    },
  };

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold">
          Um plano para cada etapa da sua jornada
        </h2>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Comece de graça e evolua quando estiver pronto. Sem pegadinhas.
        </p>
      </div>

      {/* Toggle Mensal/Anual */}
      <div className="mt-8 flex justify-center items-center gap-4">
        <span
          className={clsx(
            "font-medium",
            billingCycle === "monthly" ? "text-emerald-600" : "text-gray-500"
          )}
        >
          Mensal
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={billingCycle === "yearly"}
            onChange={() =>
              setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
            }
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
        <span
          className={clsx(
            "font-medium",
            billingCycle === "yearly" ? "text-emerald-600" : "text-gray-500"
          )}
        >
          Anual <span className="text-xs text-amber-600">(2 meses grátis)</span>
        </span>
      </div>

      {/* Cards de Preço */}
      <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Card Grátis */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col">
          <h3 className="text-xl font-semibold">{plans.free.name}</h3>
          <p className="mt-1 text-gray-500 text-sm">{plans.free.description}</p>
          <p className="mt-4 text-4xl font-bold">{plans.free.price}</p>
          <ul className="mt-6 space-y-3 text-sm flex-1">
            {plans.free.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-gray-600"
              >
                <Check size={16} className="text-emerald-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="mt-6 text-center w-full rounded-full border border-black/10 px-5 py-2.5 font-semibold hover:bg-black/5 transition-colors"
          >
            Comece agora
          </Link>
        </div>

        {/* Card Pro */}
        <div className="rounded-2xl border-2 border-emerald-500 bg-white p-6 relative flex flex-col">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            MAIS POPULAR
          </div>
          <h3 className="text-xl font-semibold">{plans.pro.name}</h3>
          <p className="mt-1 text-gray-500 text-sm">{plans.pro.description}</p>
          <p className="mt-4 text-4xl font-bold">
            {plans.pro.price}{" "}
            <span className="text-base font-medium text-gray-500">
              {plans.pro.priceSuffix}
            </span>
          </p>
          <ul className="mt-6 space-y-3 text-sm flex-1">
            {plans.pro.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-gray-600"
              >
                <Check size={16} className="text-emerald-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="mt-6 text-center w-full rounded-full bg-emerald-500 text-white px-5 py-2.5 font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
          >
            Assine o Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
