import { Trophy, Sparkles, Target, ArrowUpRight } from "lucide-react";

const goals = [
  {
    name: "Reserva de emergencia",
    current: 3200,
    target: 5000,
    reward: "Bronze",
  },
  {
    name: "Viagem de fim de ano",
    current: 1800,
    target: 4000,
    reward: "Prata",
  },
  {
    name: "Novo notebook",
    current: 900,
    target: 3000,
    reward: "Ouro",
  },
];

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Metas</h1>
          <p className="text-sm text-foreground-muted">
            Transforme seus objetivos em conquistas visuais.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition">
          <Sparkles size={16} />
          Nova meta
        </button>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const percent = Math.min(
            Math.round((goal.current / goal.target) * 100),
            100
          );
          return (
            <div
              key={goal.name}
              className="rounded-2xl border border-border bg-surface/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary grid place-items-center">
                  <Target size={18} />
                </div>
                <span className="text-xs text-foreground-subtle">
                  {goal.reward}
                </span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-foreground">
                {goal.name}
              </h2>
              <p className="text-sm text-foreground-muted">
                R$ {goal.current.toFixed(2)} de R$ {goal.target.toFixed(2)}
              </p>

              <div className="mt-4 h-2 rounded-full bg-surface-3">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-foreground-subtle">
                <span>{percent}% concluido</span>
                <span>Faltam R$ {(goal.target - goal.current).toFixed(2)}</span>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Trophy size={16} />
                  Bonus: +{Math.round(percent / 10)} pts
                </div>
                <ArrowUpRight size={16} className="text-primary" />
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-surface/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Caminho de conquistas
            </h2>
            <p className="text-sm text-foreground-muted">
              Mantenha a consistencia para desbloquear novos niveis.
            </p>
          </div>
          <span className="text-xs text-primary">Nivel 4</span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Ritmo semanal", "Economia constante", "Meta concluida"].map(
            (item, index) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-surface-2 p-4"
              >
                <div className="text-xs text-foreground-subtle">
                  Medalha {index + 1}
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {item}
                </div>
                <div className="mt-3 h-2 rounded-full bg-surface-3">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${65 + index * 10}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
