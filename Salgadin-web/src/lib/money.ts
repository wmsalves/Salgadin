/**
 * Valores no formato brasileiro: "4.800" -> 4800, "4.800,50" -> 4800.5,
 * "99,90" -> 99.9, "4800.5" -> 4800.5.
 */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d,.]/g, "");
  if (!cleaned) return 0;
  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    // so pontos em grupos de 3 digitos: separador de milhar
    normalized = cleaned.replace(/\./g, "");
  } else {
    normalized = cleaned;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
