// Cria (ou reutiliza) uma conta de teste local e popula dados de exemplo.
//
// Uso (dentro de Salgadin-web, com a API rodando):
//   npm run seed:dev
//
// - Usa o fluxo normal de cadastro/login da API (nao ha bypass de auth).
// - As credenciais ficam em .env.local (ignorado pelo git) como
//   VITE_DEV_LOGIN_EMAIL / VITE_DEV_LOGIN_PASSWORD, e o botao
//   "Entrar com conta de teste" aparece na tela de login apenas em `npm run dev`.
// - Atencao: grava no banco que a API local estiver usando.

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envLocalPath = resolve(root, ".env.local");

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, "")]),
  );
}

const env = { ...readEnvFile(resolve(root, ".env")), ...readEnvFile(envLocalPath), ...process.env };
const apiUrl = (env.VITE_API_URL || "http://localhost:5297/api").replace(/\/$/, "");

const apiHost = new URL(apiUrl).hostname;
if (!["localhost", "127.0.0.1", "[::1]"].includes(apiHost)) {
  console.error(`Recusado: VITE_API_URL aponta para ${apiHost}. Este script e apenas para API local.`);
  process.exit(1);
}

let email = env.VITE_DEV_LOGIN_EMAIL;
let password = env.VITE_DEV_LOGIN_PASSWORD;

if (!email || !password) {
  email = `dev+${randomBytes(3).toString("hex")}@salgadin.test`;
  password = `Dev!${randomBytes(6).toString("hex")}Aa1`;
  const current = existsSync(envLocalPath) ? readFileSync(envLocalPath, "utf8") : "";
  const block = `${current && !current.endsWith("\n") ? "\n" : ""}# Conta de teste local (gerada por scripts/seed-dev-user.mjs)\nVITE_DEV_LOGIN_EMAIL=${email}\nVITE_DEV_LOGIN_PASSWORD=${password}\n`;
  writeFileSync(envLocalPath, current + block);
  console.log("Credenciais de teste salvas em .env.local");
}

async function request(method, path, body, token) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`${method} ${path} -> ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function getToken() {
  try {
    return (await request("POST", "/auth/login", { username: email, password })).token;
  } catch (error) {
    if (error.status !== 401 && error.status !== 400 && error.status !== 404) throw error;
  }
  console.log("Conta de teste nao encontrada, criando...");
  const { token } = await request("POST", "/auth/register", {
    name: "Conta de Teste",
    username: email,
    password,
    confirmPassword: password,
  });
  return token;
}

const token = await getToken();
const auth = (method, path, body) => request(method, path, body, token);

const existing = await auth("GET", "/expense?page=1&pageSize=1");
const hasExpenses = Array.isArray(existing) ? existing.length > 0 : (existing?.items?.length ?? existing?.totalCount ?? 0) > 0;
if (hasExpenses) {
  console.log("A conta de teste ja possui lancamentos. Nada a popular.");
  process.exit(0);
}

const categories = await auth("GET", "/category");
const byName = Object.fromEntries(categories.map((c) => [c.name, c.id]));
const fallbackId = categories[0]?.id;
const cat = (name) => byName[name] ?? fallbackId;

const now = new Date();
const day = (offset) => {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset, 12));
  return d.toISOString();
};

await auth("POST", "/income", { description: "Salario", amount: 4800, date: day(Math.min(now.getUTCDate() - 1, 20)), isFixed: true });
await auth("POST", "/income", { description: "Freela de design", amount: 650, date: day(3), isFixed: false });

const expenses = [
  ["Cafe na padaria", 7.5, "Alimentação", 0],
  ["Coxinha e suco", 14.9, "Alimentação", 1],
  ["Uber para o trabalho", 23.4, "Transporte", 1],
  ["Almoco executivo", 32, "Alimentação", 2],
  ["Mercado da semana", 186.7, "Alimentação", 4],
  ["Aluguel", 1450, "Moradia", 5],
  ["Cinema", 42, "Lazer", 6],
  ["Delivery de pizza", 68.9, "Alimentação", 7],
  ["Onibus", 4.4, "Transporte", 8],
  ["Farmacia", 37.2, "Outros", 9],
  ["Pastel na feira", 12, "Alimentação", 10],
  ["Streaming", 39.9, "Lazer", 12],
];

for (const [description, amount, category, offset] of expenses) {
  await auth("POST", "/expense", { description, amount, categoryId: cat(category), date: day(offset) });
}

try {
  await auth("POST", "/goals", { categoryId: cat("Alimentação"), monthlyLimit: 600, alertThreshold: 0.8, isActive: true });
  await auth("POST", "/goals", { categoryId: cat("Lazer"), monthlyLimit: 150, alertThreshold: 0.75, isActive: true });
} catch (error) {
  console.warn("Nao foi possivel criar metas de exemplo:", error.message);
}

console.log(`Conta de teste pronta com ${expenses.length} despesas, 2 receitas e metas.`);
