import { Check, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

const freePlanFeatures = [
  "Cadastro de despesas e receitas",
  "Categorias e subcategorias personalizadas",
  "Dashboard mensal com gráficos e resumo diário",
  "Metas financeiras e alertas básicos",
];

const proPreviewFeatures = [
  "Histórico mais completo e filtros avançados",
  "Camadas extras de análise e exportação",
  "Acompanhamento mais profundo por período",
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="text-center">
        <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
          Comece grátis
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-foreground-muted">
          Tudo o que você precisa para organizar os pequenos gastos já está no
          plano gratuito.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium text-foreground">Free</h3>
              <p className="mt-1.5 text-ui text-foreground-muted">
                Para quem quer sair do improviso e ter uma leitura simples do mês.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <span className="tabular text-4xl font-medium text-foreground">R$ 0</span>
            <span className="ml-2 text-sm text-foreground-muted">para começar</span>
          </div>

          <ul className="mt-6 flex-1 space-y-3 text-ui">
            {freePlanFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-foreground-muted">
                <Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/signup"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-5 py-3 text-center text-sm font-medium text-[var(--color-on-primary)] shadow-[0_14px_30px_rgba(60,42,32,0.18)] transition-all hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ui-pressable"
          >
            Criar conta grátis
          </Link>
        </div>

        <div className="relative flex flex-col rounded-[var(--radius-card)] border border-dashed border-primary/30 bg-surface/78 p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] bg-[linear-gradient(135deg,rgba(184,88,47,0.04),rgba(255,255,255,0))]" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium text-foreground">Pro</h3>
              <p className="mt-1.5 text-ui text-foreground-muted">
                Para quem quer ir mais fundo no histórico e nos relatórios.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Clock3 size={12} aria-hidden="true" />
              Em breve
            </span>
          </div>


          <ul className="relative mt-6 flex-1 space-y-3 text-ui">
            {proPreviewFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-foreground-muted">
                <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled
            className="relative mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-surface-2/70 px-5 py-3 text-center font-medium text-foreground-subtle opacity-80"
          >
            Não disponível para assinatura
          </button>
        </div>
      </div>
    </section>
  );
}
