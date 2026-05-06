import { Check, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

const freePlanFeatures = [
  "Cadastro de despesas e receitas",
  "Categorias e subcategorias personalizadas",
  "Dashboard mensal com graficos e resumo diario",
  "Metas financeiras e alertas basicos",
];

const proPreviewFeatures = [
  "Historico mais completo e filtros avancados",
  "Camadas extras de analise e exportacao",
  "Acompanhamento mais profundo por periodo",
  "Experiencias futuras de integracao, como WhatsApp",
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
          Pricing
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
          Comece gratis. Evolua quando fizer sentido.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-foreground-muted">
          A experiencia principal ja resolve o essencial para quem quer organizar
          pequenos gastos. O Pro esta em breve e sera apresentado com clareza quando
          estiver pronto para uso real.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] ui-card sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-foreground">Free</h3>
              <p className="mt-2 text-sm leading-6 text-foreground-muted">
                Para quem quer sair do improviso e ter uma leitura simples do mes.
              </p>
            </div>
            <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              Disponivel agora
            </span>
          </div>

          <div className="mt-6">
            <span className="text-4xl font-extrabold text-foreground">R$ 0</span>
            <span className="ml-2 text-sm font-medium text-foreground-muted">para comecar</span>
          </div>

          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {freePlanFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-foreground-muted">
                <Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/signup"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-5 py-3 text-center font-semibold text-[var(--color-on-primary)] shadow-[0_14px_30px_rgba(60,42,32,0.18)] transition-all hover:from-[var(--brand-from-strong)] hover:to-[var(--brand-to-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ui-pressable"
          >
            Criar conta gratis
          </Link>
        </div>

        <div className="relative flex flex-col rounded-[var(--radius-card)] border border-dashed border-primary/30 bg-surface/78 p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] bg-[linear-gradient(135deg,rgba(184,88,47,0.04),rgba(255,255,255,0))]" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-foreground">Pro</h3>
              <p className="mt-2 text-sm leading-6 text-foreground-muted">
                Uma camada futura para quem quiser mais profundidade sem perder a simplicidade do produto.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Clock3 size={12} aria-hidden="true" />
              Em breve
            </span>
          </div>

          <div className="relative mt-6 rounded-2xl border border-border/70 bg-surface-2/55 px-4 py-4 text-sm leading-6 text-foreground-muted">
            O preco final ainda nao foi publicado. Primeiro, o produto precisa entregar
            uma experiencia realmente madura para justificar esse plano.
          </div>

          <ul className="relative mt-6 flex-1 space-y-3 text-sm">
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
            className="relative mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-surface-2/70 px-5 py-3 text-center font-semibold text-foreground-subtle opacity-80"
          >
            Nao disponivel para assinatura
          </button>
        </div>
      </div>
    </section>
  );
}
