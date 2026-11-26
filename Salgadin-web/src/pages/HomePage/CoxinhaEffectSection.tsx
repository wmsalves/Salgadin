import { useId, useState } from "react";

const currency = (value: number, digits = 0) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const presets = [
  { label: "Café", price: 7.5, perWeek: 5 },
  { label: "Coxinha e suco", price: 14, perWeek: 3 },
  { label: "Delivery", price: 45, perWeek: 2 },
  { label: "Uber curto", price: 18, perWeek: 4 },
];

const WEEKS_PER_YEAR = 52;

/** Calculadora do "efeito coxinha": quanto um gasto pequeno e repetido vira no ano. */
export function CoxinhaEffectSection() {
  const priceId = useId();
  const freqId = useId();
  const [price, setPrice] = useState(7.5);
  const [perWeek, setPerWeek] = useState(5);
  const [activePreset, setActivePreset] = useState<string | null>("Café");

  const perYear = price * perWeek * WEEKS_PER_YEAR;
  const perMonth = perYear / 12;

  return (
    <section id="efeito" aria-labelledby="efeito-title" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <h2 id="efeito-title" className="text-3xl font-medium text-foreground sm:text-4xl">
            O efeito coxinha
          </h2>
          <p className="mt-4 max-w-md text-base text-foreground-muted">
            Um gasto pequeno nunca parece um problema. Repetido algumas vezes por semana, ele vira
            uma conta que você não vê chegar. Faça o teste com um hábito seu.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Exemplos de gastos">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                aria-pressed={activePreset === preset.label}
                onClick={() => {
                  setPrice(preset.price);
                  setPerWeek(preset.perWeek);
                  setActivePreset(preset.label);
                }}
                className={`min-h-9 rounded-full border px-3.5 text-ui font-medium transition-colors ${
                  activePreset === preset.label
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-foreground-muted hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={priceId} className="text-ui text-foreground-muted">
                Quanto custa
              </label>
              <div className="mt-1.5 flex h-11 items-center rounded-[var(--radius-control)] border border-border bg-background px-3 focus-within:border-primary">
                <span className="text-sm text-foreground-subtle">R$</span>
                <input
                  id={priceId}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={Number.isFinite(price) ? price : ""}
                  onChange={(event) => {
                    setPrice(Math.max(0, Number(event.target.value) || 0));
                    setActivePreset(null);
                  }}
                  className="h-full min-w-0 flex-1 bg-transparent pl-2 text-sm text-foreground tabular-nums outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor={freqId} className="flex justify-between text-ui text-foreground-muted">
                <span>Vezes por semana</span>
                <span className="font-medium text-foreground tabular-nums">{perWeek}</span>
              </label>
              <input
                id={freqId}
                type="range"
                min={1}
                max={14}
                step={1}
                value={perWeek}
                onChange={(event) => {
                  setPerWeek(Number(event.target.value));
                  setActivePreset(null);
                }}
                className="mt-4 w-full accent-[var(--color-primary)]"
              />
            </div>
          </div>

          <div aria-live="polite" className="mt-7 border-t border-border pt-6">
            <p className="text-sm text-foreground-muted">Em um ano, isso vira</p>
            <p className="mt-1 text-4xl font-medium text-foreground tabular-nums sm:text-5xl">
              {currency(perYear)}
            </p>
            <p className="mt-2 text-sm text-foreground-muted">
              Cerca de <span className="font-medium text-foreground tabular-nums">{currency(perMonth)}</span>{" "}
              por mês, sem contar nenhum outro gasto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
