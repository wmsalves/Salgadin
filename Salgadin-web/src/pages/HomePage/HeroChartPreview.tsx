type ChartColors = {
  regular: string;
  attention: string;
};

const chartData = [
  { name: "Seg", gasto: 15.5, detalhe: "cafe e transporte", level: "regular" },
  { name: "Ter", gasto: 27, detalhe: "lanche", level: "regular" },
  { name: "Qua", gasto: 45.8, detalhe: "mercado", level: "attention" },
  { name: "Qui", gasto: 22.3, detalhe: "transporte", level: "regular" },
  { name: "Sex", gasto: 89.1, detalhe: "delivery e mercado", level: "attention" },
  { name: "Sab", gasto: 60, detalhe: "lazer", level: "attention" },
  { name: "Dom", gasto: 35, detalhe: "padaria", level: "regular" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function HeroChartPreview({ chartColors }: { chartColors: ChartColors }) {
  const maxValue = Math.max(...chartData.map((item) => item.gasto));

  return (
    <div className="grid h-full grid-rows-[1fr_auto] rounded-2xl border border-border/60 bg-gradient-to-b from-surface to-surface-2/50 p-4">
      <div className="grid grid-cols-[56px_1fr] gap-4">
        <div className="flex flex-col justify-between text-[11px] text-foreground-subtle">
          {[100, 75, 50, 25, 0].map((mark) => (
            <span key={mark}>R$ {mark}</span>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                key={line}
                className="border-t border-dashed border-border/70"
              />
            ))}
          </div>
          <div className="absolute left-0 right-0 top-[55%] border-t border-dashed border-[var(--chart-reference)]/70" />

          <div className="relative flex h-full items-end justify-between gap-3 px-1 pt-4">
            {chartData.map((item) => {
              const height = `${Math.max((item.gasto / maxValue) * 100, 12)}%`;
              const fill =
                item.level === "attention"
                  ? chartColors.attention
                  : chartColors.regular;

              return (
                <div
                  key={item.name}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div className="text-center text-[11px] text-foreground-muted">
                    {formatCurrency(item.gasto)}
                  </div>
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-[10px] rounded-b-[4px] shadow-[0_10px_24px_rgba(60,42,32,0.12)]"
                      style={{ height, backgroundColor: fill }}
                      title={`${item.name}: ${formatCurrency(item.gasto)} em ${item.detalhe}`}
                    />
                  </div>
                  <div className="text-[12px] font-medium text-foreground-subtle">
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border/70 bg-surface/80 px-3 py-2 text-xs text-foreground-muted">
        <span>Ritmo do dia: R$ 40</span>
        <span className="font-medium text-foreground">7 lancamentos</span>
      </div>
    </div>
  );
}
