import { LockKeyhole } from "lucide-react";
import { trustItems } from "./content";

export function TrustSection() {
  return (
    <section id="trust" className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div>
        <div className="grid gap-10">
          <div>
            <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
              Seus dados financeiros tratados com cuidado
            </h2>
            <p className="mt-4 max-w-xl text-base text-foreground-muted">
              Você registra só o que quiser, e cada conta enxerga apenas os
              próprios lançamentos. Nada de senha de banco ou acesso automático
              às suas contas.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-surface-2/55 p-4 text-ui text-foreground-muted">
              <div className="flex items-start gap-3">
                <LockKeyhole size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <p>
                  Sua senha é guardada com hash e o login pode ser feito com
                  e-mail ou com a sua conta Google.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-ui text-foreground-muted">
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
