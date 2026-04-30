import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  getMonthlyReport,
  getWeeklyReport,
  compareMonthlyReports,
  getReportSummary,
} from "../services/reportService";
import { exportExpenses } from "../services/exportService";
import type {
  ReportComparison,
  ReportResponse,
  ReportSummary,
  Subcategory,
} from "../lib/types";
import { getCategories, type Category } from "../services/categoryService";
import { getSubcategories } from "../services/subcategoryService";

type ReportMode = "monthly" | "weekly";

type ReportFilters = {
  categoryId?: number;
  subcategoryId?: number;
  minAmount?: number;
  maxAmount?: number;
};

export default function ReportsPage() {
  const [mode, setMode] = useState<ReportMode>("monthly");
  const [monthlyValue, setMonthlyValue] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [comparison, setComparison] = useState<ReportComparison | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareMonthValue, setCompareMonthValue] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
  );

  const draftFilterParams = useMemo<ReportFilters>(() => {
    return {
      categoryId: categoryId === "" ? undefined : Number(categoryId),
      subcategoryId: subcategoryId === "" ? undefined : Number(subcategoryId),
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    };
  }, [categoryId, subcategoryId, minAmount, maxAmount]);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({});

  const fetchReport = useCallback(async (filters: ReportFilters = appliedFilters) => {
    setIsLoading(true);
    const periodStart = mode === "monthly" ? `${monthlyValue}-01` : startDate;
    const periodEnd =
      mode === "monthly"
        ? (() => {
            const [year, month] = monthlyValue.split("-").map(Number);
            const lastDay = new Date(Date.UTC(year, month, 0));
            return lastDay.toISOString().slice(0, 10);
          })()
        : endDate;
    if (mode === "monthly") {
      const [year, month] = monthlyValue.split("-").map(Number);
      if (compareEnabled) {
        const [compareYear, compareMonth] = compareMonthValue
          .split("-")
          .map(Number);
        const data = await compareMonthlyReports(
          year,
          month,
          compareYear,
          compareMonth,
          filters,
        );
        setComparison(data);
        setReport(data.current);
      } else {
        const data = await getMonthlyReport(year, month, filters);
        setReport(data);
        setComparison(null);
      }
    } else {
      const data = await getWeeklyReport(startDate, endDate, filters);
      setReport(data);
      setComparison(null);
    }
    if (periodStart && periodEnd) {
      const summaryData = await getReportSummary(periodStart, periodEnd, filters);
      setSummary(summaryData);
    }
    setIsLoading(false);
  }, [
    appliedFilters,
    compareEnabled,
    compareMonthValue,
    endDate,
    mode,
    monthlyValue,
    startDate,
  ]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    const fetchFilters = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (categoryId === "") {
      setSubcategories([]);
      setSubcategoryId("");
      return;
    }
    const fetchSubs = async () => {
      const data = await getSubcategories(Number(categoryId));
      setSubcategories(data);
    };
    fetchSubs();
  }, [categoryId]);

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
      report?.endDate?.slice(0, 10),
      appliedFilters,
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
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setCompareEnabled((prev) => !prev)}
                  className={`w-full rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    compareEnabled
                      ? "border-primary text-primary"
                      : "border-border text-foreground-muted"
                  }`}
                >
                  Comparar mes
                </button>
              </div>
              {compareEnabled ? (
                <div>
                  <label className="text-xs text-foreground-muted">
                    Comparar com
                  </label>
                  <input
                    type="month"
                    value={compareMonthValue}
                    onChange={(event) => setCompareMonthValue(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-foreground-muted">Inicio</label>
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
              <div className="hidden md:block"></div>
            </>
          )}
          <div className="flex items-end">
            <button
              onClick={() => {
                const nextFilters = JSON.stringify(draftFilterParams);
                const currentFilters = JSON.stringify(appliedFilters);
                if (nextFilters !== currentFilters) {
                  setAppliedFilters(draftFilterParams);
                  return;
                }
                fetchReport(draftFilterParams);
              }}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-3 transition-colors active:scale-[0.98]"
            >
              Atualizar
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-foreground-muted">Categoria</label>
            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
              className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-foreground-muted">Subcategoria</label>
            <select
              value={subcategoryId}
              onChange={(event) =>
                setSubcategoryId(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
              className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              disabled={categoryId === ""}
            >
              <option value="">Todas</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-foreground-muted">
              Valor minimo
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(event) => setMinAmount(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-foreground-muted">
              Valor maximo
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(event) => setMaxAmount(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              placeholder="5000"
            />
          </div>
        </div>
      </section>

      {!report ? (
        <div className="rounded-3xl border border-border/70 bg-surface/92 p-12 text-center text-foreground-subtle flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
          <div className="h-10 w-10 text-primary animate-spin">
            <svg
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          Carregando dados financeiros...
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all ${isLoading ? "opacity-40 grayscale-[0.2] pointer-events-none blur-[1px]" : ""}`}
        >
          {summary && (
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs text-foreground-subtle">Total</p>
                <p className="text-lg font-semibold text-foreground">
                  R$ {summary.total.toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs text-foreground-subtle">Media diaria</p>
                <p className="text-lg font-semibold text-foreground">
                  R$ {summary.averageDaily.toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs text-foreground-subtle">Maior dia</p>
                <p className="text-sm font-semibold text-foreground">
                  {summary.biggestDay ?? "N/A"}
                </p>
                <p className="text-xs text-foreground-muted">
                  R$ {summary.biggestDayTotal.toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs text-foreground-subtle">
                  Tendencia vs periodo anterior
                </p>
                <p
                  className={`text-lg font-semibold ${
                    summary.trendPercent >= 0 ? "text-danger" : "text-primary"
                  }`}
                >
                  {(summary.trendPercent * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
          {summary && summary.insights.length > 0 && (
            <div className="xl:col-span-3 rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Insights automaticos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summary.insights.map((insight, index) => (
                  <div
                    key={`${insight.title}-${index}`}
                    className="rounded-2xl border border-border bg-surface-2 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-foreground-subtle">
                      {insight.title}
                    </p>
                    <p
                      className={`mt-2 text-sm font-semibold ${
                        insight.tone === "positive"
                          ? "text-primary"
                          : insight.tone === "negative"
                            ? "text-danger"
                            : "text-foreground"
                      }`}
                    >
                      {insight.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div
            className="xl:col-span-2 rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover animate-fade-in opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Evolucao de gastos
                </h2>
                <p className="text-xs text-foreground-subtle">
                  Total: R$ {report.total.toFixed(2)}
                </p>
                {comparison && (
                  <p className="text-xs text-foreground-subtle mt-1">
                    Variacao:{" "}
                    <span
                      className={
                        comparison.deltaTotal >= 0
                          ? "text-danger"
                          : "text-primary"
                      }
                    >
                      R$ {comparison.deltaTotal.toFixed(2)} (
                      {(comparison.deltaPercent * 100).toFixed(1)}%)
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient
                      id="reportGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="rgba(242,139,91,0)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="4 4"
                    vertical={false}
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--chart-muted)" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$ ${value}`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--chart-muted)" }}
                  />
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

          <div
            className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover animate-fade-in opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: "150ms" }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Por categoria
            </h2>
            <div className="space-y-3">
              {report.byCategory.length > 0 ? (
                report.byCategory.map((item, index) => (
                  <div
                    key={item.category}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm soft-hover-sm hover:bg-surface-3 animate-fade-in opacity-0 [animation-fill-mode:forwards]"
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
