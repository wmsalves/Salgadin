import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = {
    free: {
      name: "Gratis",
      price: "R$ 0",
      description: "Para quem esta comecando a organizar os gastos diarios.",
      features: [
        "Cadastro de despesas ilimitado",
        "Ate 5 categorias personalizadas",
        "Criacao de 1 meta financeira",
        "Acesso ao dashboard mensal",
      ],
    },
    pro: {
      name: "Pro",
      price: billingCycle === "monthly" ? "R$ 9,90" : "R$ 99",
      priceSuffix: billingCycle === "monthly" ? "/mes" : "/ano",
      description: "Para quem busca controle total e insights inteligentes.",
      features: [
        "Tudo do plano Gratis, sem limites",
        "Orcamentos com alertas",
        "Relatorios avancados e exportacao",
        "Historico de despesas completo",
        "Suporte prioritario",
      ],
    },
  };

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-24">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
          Um plano para cada etapa da sua jornada
        </h2>
        <p className="mt-3 text-foreground-muted max-w-xl mx-auto">
          Comece de graca e evolua quando estiver pronto. Sem pegadinhas.
        </p>
      </div>

      <div className="mt-8 flex justify-center items-center gap-4">
        <span
          className={clsx(
            "font-medium",
            billingCycle === "monthly"
              ? "text-primary"
              : "text-foreground-subtle"
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
          <div className="w-11 h-6 bg-surface-3 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
        </label>
        <span
          className={clsx(
            "font-medium",
            billingCycle === "yearly"
              ? "text-primary"
              : "text-foreground-subtle"
          )}
        >
          Anual <span className="text-xs text-accent">(2 meses gratis)</span>
        </span>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col ui-card">
          <h3 className="text-xl font-semibold text-foreground">
            {plans.free.name}
          </h3>
          <p className="mt-1 text-foreground-subtle text-sm">
            {plans.free.description}
          </p>
          <p className="mt-4 text-4xl font-bold text-foreground">
            {plans.free.price}
          </p>
          <ul className="mt-6 space-y-3 text-sm flex-1">
            {plans.free.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-foreground-muted"
              >
                <Check size={16} className="text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="mt-6 text-center w-full rounded-full border border-border px-5 py-2.5 font-semibold text-foreground-muted hover:bg-surface-2 transition-colors ui-pressable"
          >
            Comece agora
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-accent bg-surface p-6 relative flex flex-col shadow-[0_0_0_1px_rgba(20,184,166,0.15)] ui-card">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
            MAIS POPULAR
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            {plans.pro.name}
          </h3>
          <p className="mt-1 text-foreground-subtle text-sm">
            {plans.pro.description}
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={plans.pro.price}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl font-bold text-foreground"
              >
                {plans.pro.price}
              </motion.span>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.span
                key={plans.pro.priceSuffix}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-base font-medium text-foreground-subtle"
              >
                {plans.pro.priceSuffix}
              </motion.span>
            </AnimatePresence>
          </div>
          <ul className="mt-6 space-y-3 text-sm flex-1">
            {plans.pro.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-foreground-muted"
              >
                <Check size={16} className="text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="mt-6 text-center w-full rounded-full bg-accent text-white px-5 py-2.5 font-semibold hover:bg-accent-strong transition-colors shadow-sm ui-pressable"
          >
            Assine o Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
