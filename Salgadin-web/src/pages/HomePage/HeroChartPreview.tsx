import { useEffect, useState } from "react";

type ChartColors = {
  regular: string;
  attention: string;
};

type SpendingPart = {
  label: string;
  value: number;
  tone: "regular" | "attention";
};

type ChartDay = {
  name: string;
  detalhe: string;
  spending: SpendingPart[];
};

const chartData: ChartDay[] = [
  {
    name: "Seg",
    detalhe: "cafe e transporte",
    spending: [
      { label: "Alimentação", value: 8.5, tone: "regular" },
      { label: "Transporte", value: 7, tone: "regular" },
    ],
  },
  {
    name: "Ter",
    detalhe: "alimentação e transporte",
    spending: [
      { label: "Alimentação", value: 20, tone: "regular" },
      { label: "Transporte", value: 50, tone: "attention" },
    ],
  },
  {
    name: "Qua",
    detalhe: "mercado e padaria",
    spending: [
      { label: "Mercado", value: 33.8, tone: "attention" },
      { label: "Padaria", value: 12, tone: "regular" },
    ],
  },
  {
    name: "Qui",
    detalhe: "transporte e lanche",
    spending: [
      { label: "Transporte", value: 14.3, tone: "regular" },
      { label: "Lanche", value: 8, tone: "regular" },
    ],
  },
  {
    name: "Sex",
    detalhe: "delivery e mercado",
    spending: [
      { label: "Delivery", value: 41.1, tone: "attention" },
      { label: "Mercado", value: 48, tone: "attention" },
    ],
  },
  {
    name: "Sab",
    detalhe: "lazer e transporte",
    spending: [
      { label: "Lazer", value: 38, tone: "attention" },
      { label: "Transporte", value: 22, tone: "regular" },
    ],
  },
  {
    name: "Dom",
    detalhe: "padaria e almoço",
    spending: [
      { label: "Padaria", value: 11, tone: "regular" },
      { label: "Almoço", value: 24, tone: "regular" },
    ],
  },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function getAxisMax(maxValue: number) {
  if (maxValue <= 0) {
    return 10;
  }

  return Math.ceil((maxValue * 1.1) / 10) * 10;
}

export function HeroChartPreview({
  chartColors,
}: {
  chartColors: ChartColors;
}) {
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);
  const normalizedData = chartData.map((day) => ({
    ...day,
    total: day.spending.reduce((sum, item) => sum + item.value, 0),
  }));
  const axisMax = getAxisMax(
    Math.max(...normalizedData.map((item) => item.total)),
  );
  const axisMarks = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
    Math.round(axisMax * ratio),
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsAnimatedIn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="grid h-full grid-rows-[1fr_auto] rounded-2xl border border-border/60 bg-gradient-to-b from-surface to-surface-2/50 p-4 sm:p-5">
      <div className="grid h-full min-h-0 grid-cols-[56px_1fr] gap-4">
        <div className="flex h-full min-h-0 flex-col justify-between text-[11px] text-foreground-subtle">
          {axisMarks.map((mark) => (
            <span key={mark}>R$ {mark}</span>
          ))}
        </div>

        <div className="relative h-full min-h-0">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                key={line}
                className="border-t border-dashed border-border/70"
              />
            ))}
          </div>

          <div className="relative flex h-full min-h-0 items-end justify-between gap-3 px-1 pt-4">
            {normalizedData.map((day) => (
              <div
                key={day.name}
                className="group relative flex h-full min-h-0 min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="pointer-events-none absolute -top-2 left-1/2 z-10 w-44 -translate-x-1/2 -translate-y-full rounded-xl border border-border/70 bg-surface px-3 py-2 text-left opacity-0 shadow-[0_18px_36px_rgba(60,42,32,0.14)] transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                  <p className="text-[11px] font-semibold text-foreground">
                    {day.name} - {formatCurrency(day.total)}
                  </p>
                  <div className="mt-1.5 space-y-1">
                    {day.spending.map((item) => (
                      <div
                        key={`${day.name}-${item.label}`}
                        className="flex items-center justify-between gap-2 text-[11px] text-foreground-muted"
                      >
                        <span>{item.label}</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center text-[11px] font-medium text-foreground-muted">
                  {formatCurrency(day.total)}
                </div>

                <div className="flex h-full min-h-0 w-full items-end">
                  <button
                    type="button"
                    className="flex h-full min-h-0 w-full items-end rounded-t-[10px] rounded-b-[4px] bg-transparent p-0 text-left transition duration-200 group-hover:-translate-y-0.5"
                    title={`${day.name}: ${formatCurrency(day.total)} em ${day.detalhe}`}
                  >
                    <div
                      className="flex h-full w-full origin-bottom flex-col justify-end overflow-hidden rounded-t-[10px] rounded-b-[4px] border border-white/15 shadow-[0_12px_26px_rgba(60,42,32,0.14)] transition-[transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{
                        transform: isAnimatedIn ? "scaleY(1)" : "scaleY(0.04)",
                        transitionDelay: `${normalizedData.findIndex((item) => item.name === day.name) * 90}ms`,
                      }}
                    >
                      {day.spending
                        .slice()
                        .reverse()
                        .map((item, index) => {
                          const height = `${(item.value / axisMax) * 100}%`;
                          const fill =
                            item.tone === "attention"
                              ? index === 0
                                ? chartColors.attention
                                : "color-mix(in srgb, var(--color-warning) 75%, white 25%)"
                              : index === 0
                                ? chartColors.regular
                                : "color-mix(in srgb, var(--color-primary) 72%, white 28%)";

                          return (
                            <div
                              key={`${day.name}-${item.label}`}
                              style={{ height, backgroundColor: fill }}
                              className="w-full border-t border-white/20 first:border-t-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                            />
                          );
                        })}
                    </div>
                  </button>
                </div>

                <div className="text-[12px] font-medium text-foreground-subtle">
                  {day.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border/70 bg-surface/80 px-3 py-3 text-xs text-foreground-muted">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Ritmo do dia: R$ 40</span>
          <span className="font-medium text-foreground">
            14 lançamentos no exemplo
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-2 px-2.5 py-1">
            Alimentação + transporte na terça
          </span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1">
            Sexta foi o pico com delivery e mercado
          </span>
        </div>
      </div>
    </div>
  );
}
