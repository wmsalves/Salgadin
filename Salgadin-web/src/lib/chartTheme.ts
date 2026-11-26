import type { CSSProperties } from "react";

/** Estilo unico dos graficos (Recharts), sempre a partir dos tokens do tema. */
export const chartTick = {
  fill: "var(--color-text-subtle)",
  fontSize: 12,
  fontFamily: "inherit",
} as const;

export const chartAxis = {
  tickLine: false,
  axisLine: false,
  tick: chartTick,
  tickMargin: 8,
} as const;

export const chartGrid = {
  stroke: "var(--color-border)",
  strokeDasharray: "3 4",
  vertical: false,
} as const;

export const chartTooltipStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  boxShadow: "var(--shadow-overlay)",
  color: "var(--color-text)",
  fontSize: 13,
  padding: "8px 12px",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  marginBottom: 2,
};

export const chartCursor = {
  stroke: "var(--color-border)",
  strokeWidth: 1,
} as const;

/** "R$ 1,2 mil" para eixos: curto e sem quebrar linha. */
export const formatAxisCurrency = (value: number) =>
  value >= 1000
    ? `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`
    : `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
