import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, CalendarRange } from "lucide-react";
import { getMonthlyReport, getWeeklyReport } from "../services/reportService";
import { exportExpenses } from "../services/exportService";
import type { ReportResponse } from "../lib/types";

type ReportMode = "monthly" | "weekly";

export default function ReportsPage() {
  const [mode, setMode] = useState<ReportMode>("monthly");
  const [monthlyValue, setMonthlyValue] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    if (mode === "monthly") {
      const [year, month] = monthlyValue.split("-").map(Number);
      const data = await getMonthlyReport(year, month);
      setReport(data);
    } else {
      const data = await getWeeklyReport(startDate, endDate);
      setReport(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [mode, monthlyValue, startDate, endDate]);

  const series = useMemo(() => {
    if (!report) return [];
    return report.series.map((item) => ({
      day: new Date(item.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
      value: item.total,
    }));
  }, [report]);

  const handleExport = async (format: "csv" | "pdf") => {
    const file = await exportExpenses(
      format,
      report?.startDate?.slice(0, 10),
      report?.endDate?.slice(0, 10)
    );
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${mode}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
          <p className="text-sm text-foreground-muted">
            Visualize tendencias e acompanhe sua evolucao financeira.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition"
          >
            <Download size={16} />
            PDF
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <CalendarRange size={16} />
            Periodo
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("monthly")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                mode === "monthly"
                  ? "bg-primary text-white"
                  : "border border-border text-foreground-muted"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setMode("weekly")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                mode === "weekly"
                  ? "bg-primary text-white"
                  : "border border-border text-foreground-muted"
              }`}
            >
              Semanal
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {mode === "monthly" ? (
            <>
              <div>
                <label className="text-xs text-foreground-muted">Mes</label>
                <input
                  type="month"
                  value={monthlyValue}
                  onChange={(event) => setMonthlyValue(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {/* Spacer para travar o Grid e nao pular layout */}
              <div className="hidden md:block"></div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-foreground-muted">
                  Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Fim</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-3 transition-colors active:scale-[0.98]"
            >
              Atualizar
            </button>
          </div>
        </div>
      </section>

      {!report ? (
        <div className="rounded-3xl border border-border/70 bg-surface/75 backdrop-blur-xl p-12 text-center text-foreground-subtle flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
          <div className="h-10 w-10 text-primary animate-spin">
             <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          Carregando dados financeiros...
        </div>
      ) : (
        <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all ${isLoading ? 'opacity-40 grayscale-[0.2] pointer-events-none blur-[1px]' : ''}`}>
          <div className="xl:col-span-2 rounded-3xl border border-border/70 bg-gradient-to-br from-surface/90 via-surface/75 to-surface-2/70 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)] animate-fade-in opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Evolucao de gastos
                </h2>
                <p className="text-xs text-foreground-subtle">
                  Total: R$ {report.total.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="rgba(242,139,91,0)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                    vertical={false}
                    opacity={0.6}
                  />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--chart-muted)" }} />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} tickLine={false} axisLine={false} tick={{ fill: "var(--chart-muted)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                      borderRadius: "16px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--color-primary)" }}
                    fill="url(#reportGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/90 via-surface/75 to-surface-2/70 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)] animate-fade-in opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: "150ms" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Por categoria
            </h2>
            <div className="space-y-3">
              {report.byCategory.length > 0 ? (
                report.byCategory.map((item, index) => (
                  <div
                    key={item.category}
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm hover:translate-x-1 hover:bg-surface-3 transition-transform animate-fade-in opacity-0 [animation-fill-mode:forwards]"
                  >
                    <span className="text-foreground">{item.category}</span>
                    <span className="text-foreground-muted">
                      R$ {item.total.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-foreground-subtle">
                  Nenhuma categoria encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
