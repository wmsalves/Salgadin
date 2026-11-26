import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, LineChart, PieChart, SlidersHorizontal } from "lucide-react";
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
import { EmptyState } from "../components/EmptyState";
import { PageHeader, StatRow } from "../components/PageHeader";
import { AnimatePresence, motion } from "framer-motion";
import { collapseMotion, MOTION, MOTION_EASE } from "../lib/motion";
import {
  chartAxis,
  chartCursor,
  chartGrid,
  chartTooltipLabelStyle,
  chartTooltipStyle,
  formatAxisCurrency,
} from "../lib/chartTheme";

const filterInputClass =
  "h-10 w-full rounded-[var(--radius-control)] border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50";

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 lg:w-44">
      <label htmlFor={htmlFor} className="mb-1 block text-xs text-foreground-subtle">
        {label}
      </label>
      {children}
    </div>
  );
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (ratio: number) =>
  `${(ratio * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

// "2026-11-21" -> "21 de nov." sem passar por fuso horario.
const formatDayLabel = (value: string | null | undefined) => {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return new Date(Date.UTC(+year, +month - 1, +day)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
};

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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
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
  const hasReportData = useMemo(
    () => series.some((item) => item.value > 0) || (report?.total ?? 0) > 0,
    [report?.total, series],
  );

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
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Tendências do período, comparação com o anterior e exportação."
        actions={
          <>
            <button type="button" onClick={() => handleExport("csv")} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-surface px-3.5 text-ui font-medium text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50">
              <Download size={15} />
              CSV
            </button>
            <button type="button" onClick={() => handleExport("pdf")} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-surface px-3.5 text-ui font-medium text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50">
              <Download size={15} />
              PDF
            </button>
          </>
        }
      />

      <section aria-label="Filtros do relatório" className="rounded-2xl border border-border bg-surface">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div
            role="radiogroup"
            aria-label="Tipo de período"
            className="inline-flex h-10 w-fit items-center rounded-[var(--radius-control)] border border-border bg-background p-1"
          >
            {(
              [
                ["monthly", "Mensal"],
                ["weekly", "Semanal"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => setMode(value)}
                className={`h-full rounded-md px-3 text-ui font-medium transition-colors ${
                  mode === value
                    ? "bg-surface text-foreground shadow-[var(--shadow-card)]"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "monthly" ? (
            <>
              <FilterField label="Mês" htmlFor="report-month">
                <input
                  id="report-month"
                  type="month"
                  value={monthlyValue}
                  onChange={(event) => setMonthlyValue(event.target.value)}
                  className={filterInputClass}
                />
              </FilterField>
              {compareEnabled && (
                <FilterField label="Comparar com" htmlFor="report-compare">
                  <input
                    id="report-compare"
                    type="month"
                    value={compareMonthValue}
                    onChange={(event) => setCompareMonthValue(event.target.value)}
                    className={filterInputClass}
                  />
                </FilterField>
              )}
            </>
          ) : (
            <>
              <FilterField label="Início" htmlFor="report-start">
                <input
                  id="report-start"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={filterInputClass}
                />
              </FilterField>
              <FilterField label="Fim" htmlFor="report-end">
                <input
                  id="report-end"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={filterInputClass}
                />
              </FilterField>
            </>
          )}

          <FilterField label="Categoria" htmlFor="report-category">
            <select
              id="report-category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value ? Number(event.target.value) : "")
              }
              className={filterInputClass}
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FilterField>

          <div className="flex items-center gap-2 lg:ml-auto">
            <button
              type="button"
              onClick={() => setShowMoreFilters((prev) => !prev)}
              aria-expanded={showMoreFilters}
              aria-controls="report-more-filters"
              className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-control)] border border-border px-3 text-ui font-medium text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <SlidersHorizontal size={14} />
              {showMoreFilters ? "Menos filtros" : "Mais filtros"}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextFilters = JSON.stringify(draftFilterParams);
                const currentFilters = JSON.stringify(appliedFilters);
                if (nextFilters !== currentFilters) {
                  setAppliedFilters(draftFilterParams);
                  return;
                }
                fetchReport(draftFilterParams);
              }}
              className="inline-flex h-10 items-center rounded-[var(--radius-control)] bg-primary px-4 text-ui font-medium text-[var(--color-on-primary)] transition-colors hover:bg-primary-strong"
            >
              Aplicar
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showMoreFilters && (
            <motion.div
              id="report-more-filters"
              {...collapseMotion}
              transition={MOTION.smooth}
              className="overflow-hidden"
            >
              <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
                {mode === "monthly" && (
                  <label className="flex h-10 items-center gap-2 self-end text-ui text-foreground">
                    <input
                      type="checkbox"
                      checked={compareEnabled}
                      onChange={() => setCompareEnabled((prev) => !prev)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    Comparar com outro mês
                  </label>
                )}
                <FilterField label="Subcategoria" htmlFor="report-subcategory">
                  <select
                    id="report-subcategory"
                    value={subcategoryId}
                    onChange={(event) =>
                      setSubcategoryId(event.target.value ? Number(event.target.value) : "")
                    }
                    className={filterInputClass}
                    disabled={categoryId === ""}
                  >
                    <option value="">Todas</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Valor mínimo (R$)" htmlFor="report-min">
                  <input
                    id="report-min"
                    type="number"
                    inputMode="decimal"
                    value={minAmount}
                    onChange={(event) => setMinAmount(event.target.value)}
                    className={filterInputClass}
                    placeholder="0"
                  />
                </FilterField>
                <FilterField label="Valor máximo (R$)" htmlFor="report-max">
                  <input
                    id="report-max"
                    type="number"
                    inputMode="decimal"
                    value={maxAmount}
                    onChange={(event) => setMaxAmount(event.target.value)}
                    className={filterInputClass}
                    placeholder="Sem limite"
                  />
                </FilterField>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {!report ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center text-foreground-subtle flex flex-col items-center justify-center gap-4">
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
            <div className="xl:col-span-3">
              <StatRow
                items={[
                  { label: "Total", value: formatCurrency(summary.total) },
                  { label: "Média diária", value: formatCurrency(summary.averageDaily) },
                  {
                    label: "Maior dia",
                    value: formatDayLabel(summary.biggestDay),
                    hint: formatCurrency(summary.biggestDayTotal),
                  },
                  {
                    label: "Vs. período anterior",
                    value: `${summary.trendPercent > 0 ? "+" : ""}${formatPercent(summary.trendPercent)}`,
                    tone:
                      summary.trendPercent > 0.005
                        ? "danger"
                        : summary.trendPercent < -0.005
                          ? "success"
                          : "default",
                    hint:
                      summary.trendPercent > 0.005
                        ? "Gastou mais"
                        : summary.trendPercent < -0.005
                          ? "Gastou menos"
                          : "Estável",
                  },
                ]}
              />
            </div>
          )}
          {summary && summary.insights.length > 0 && (
            <div className="xl:col-span-3 rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-base font-medium text-foreground mb-4">
                Insights automáticos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summary.insights.map((insight, index) => (
                  <div
                    key={`${insight.title}-${index}`}
                    className="rounded-2xl border border-border bg-surface-2 p-4"
                  >
                    <p className="text-xs text-foreground-subtle">
                      {insight.title}
                    </p>
                    <p
                      className={`mt-2 text-sm font-medium ${
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
            className="xl:col-span-2 rounded-2xl border border-border bg-surface p-6 soft-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-medium text-foreground">
                  Evolução de gastos
                </h2>
                <p className="text-xs text-foreground-subtle">
                  Total: {formatCurrency(report.total)}
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
                      {formatCurrency(comparison.deltaTotal)} (
                      {formatPercent(comparison.deltaPercent)})
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="h-[280px]">
              {hasReportData ? (
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
                    <CartesianGrid {...chartGrid} />
                    <XAxis dataKey="day" {...chartAxis} minTickGap={16} />
                    <YAxis {...chartAxis} width={72} tickFormatter={formatAxisCurrency} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={chartTooltipLabelStyle}
                      cursor={chartCursor}
                      formatter={(value) => [formatCurrency(Number(value)), "Gasto"]}
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
              ) : (
                <EmptyState
                  icon={LineChart}
                  title="Sem dados suficientes ainda"
                  description="Registre algumas despesas para transformar seus lançamentos em tendências e comparações."
                  primaryAction={{ label: "Ir para o dashboard", href: "/dashboard" }}
                  compact
                  className="flex h-full flex-col items-center justify-center"
                />
              )}
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <h2 className="text-base font-medium text-foreground mb-4">
              Por categoria
            </h2>
            <div className="space-y-4">
              {report.byCategory.length > 0 ? (
                report.byCategory.map((item) => {
                  const max = Math.max(...report.byCategory.map((c) => c.total), 1);
                  const share = report.total > 0 ? item.total / report.total : 0;
                  return (
                    <div key={item.category}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{item.category}</span>
                        <span className="shrink-0 tabular-nums text-foreground">
                          {formatCurrency(item.total)}
                          <span className="ml-2 text-xs text-foreground-subtle">
                            {Math.round(share * 100)}%
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.total / max) * 100}%` }}
                          transition={{ duration: 0.5, ease: MOTION_EASE }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon={PieChart}
                  title="Categorias ainda sem movimento"
                  description="Quando você cadastrar gastos por categoria, este resumo mostra onde os pequenos valores estão se acumulando."
                  primaryAction={{ label: "Criar categorias", href: "/lancamentos/categorias" }}
                  compact
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
