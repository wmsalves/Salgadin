import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      description: "Para quem quer acompanhar o mês com mais filtros e histórico.",
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
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          Um plano para cada etapa da sua jornada
        </h2>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-foreground-muted">
          Comece de graça e evolua quando estiver pronto. Sem pegadinhas.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <div
          role="group"
          aria-label="Escolher ciclo de cobrança"
          className="inline-flex rounded-2xl border border-border bg-surface/80 p-1 shadow-[0_10px_24px_rgba(60,42,32,0.08)]"
        >
          <button
            type="button"
            aria-pressed={billingCycle === "monthly"}
            onClick={() => setBillingCycle("monthly")}
            className={clsx(
              "min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              billingCycle === "monthly"
                ? "bg-surface-2 text-primary shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            Mensal
          </button>
          <button
            type="button"
            aria-pressed={billingCycle === "yearly"}
            onClick={() => setBillingCycle("yearly")}
            className={clsx(
              "min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              billingCycle === "yearly"
                ? "bg-surface-2 text-primary shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            Anual <span className="text-xs text-accent">(2 meses grátis)</span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-8 md:grid-cols-2">
        <div className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] ui-card">
          <h3 className="text-xl font-semibold text-foreground">
            {plans.free.name}
          </h3>
          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            {plans.free.description}
          </p>
          <p className="mt-4 text-4xl font-bold text-foreground">
            {plans.free.price}
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {plans.free.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-foreground-muted"
              >
                <Check size={16} className="text-success" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-primary/30 bg-surface px-5 py-2.5 text-center font-semibold text-primary-strong transition-colors hover:border-primary hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ui-pressable"
          >
            Comece agora
          </Link>
        </div>

        <div className="relative flex flex-col rounded-[var(--radius-card)] border-2 border-primary bg-surface p-6 shadow-[var(--shadow-card)] ui-card">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-xl bg-primary px-3 py-1 text-xs font-bold text-[var(--color-on-primary)] shadow-[0_10px_22px_rgba(60,42,32,0.16)]">
            MAIS POPULAR
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            {plans.pro.name}
          </h3>
          <p className="mt-1 text-sm leading-6 text-foreground-muted">
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
                className="text-base font-medium text-foreground-muted"
              >
                {plans.pro.priceSuffix}
              </motion.span>
            </AnimatePresence>
          </div>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {plans.pro.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-foreground-muted"
              >
                <Check size={16} className="text-success" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-5 py-2.5 text-center font-semibold text-[var(--color-on-primary)] shadow-[0_14px_30px_rgba(60,42,32,0.18)] transition-all hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ui-pressable"
          >
            Assine o Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
