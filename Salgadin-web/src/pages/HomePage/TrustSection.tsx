import { LockKeyhole, ShieldCheck } from "lucide-react";
import { trustItems } from "./content";

export function TrustSection() {
  return (
    <section id="trust" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="rounded-[var(--radius-card)] border border-border/70 bg-surface/90 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface-2/65 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <ShieldCheck size={14} aria-hidden="true" />
              Confianca e privacidade
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-foreground sm:text-4xl">
              Controle financeiro com postura de produto serio
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-foreground-muted">
              O Salgadin trata dados financeiros pessoais com clareza. A experiencia e
              feita para ajudar o usuario a entender seus habitos sem inventar
              integracoes que ainda nao estao prontas.
            </p>
            <div className="mt-6 rounded-2xl border border-border/70 bg-surface-2/55 p-4 text-sm leading-6 text-foreground-muted">
              <div className="flex items-start gap-3">
                <LockKeyhole size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <p>
                  Hoje o foco e simples: voce registra, organiza e acompanha seus
                  proprios lancamentos. Isso torna a experiencia mais previsivel,
                  transparente e util para quem quer comecar agora.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:grid-cols-2">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/70 bg-surface-2/50 p-5"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary shadow-[0_8px_18px_rgba(60,42,32,0.08)]">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
