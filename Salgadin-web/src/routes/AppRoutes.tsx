import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "../components/AppShell";
import { SectionLayout } from "../components/SectionLayout";

const HomePage = lazy(() => import("../pages/HomePage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const TermsPage = lazy(() => import("../pages/TermsPage"));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const CategoriesPage = lazy(() => import("../pages/CategoriesPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const GoalsPage = lazy(() => import("../pages/GoalsPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const TransactionsPage = lazy(() => import("../pages/TransactionsPage"));
const RecurringSchedulesPage = lazy(
  () => import("../pages/RecurringSchedulesPage"),
);
const FinancialCalendarPage = lazy(
  () => import("../pages/FinancialCalendarPage"),
);

const transactionTabs = [
  { to: "/lancamentos", label: "Lançamentos", end: true },
  { to: "/lancamentos/recorrentes", label: "Recorrentes" },
  { to: "/lancamentos/categorias", label: "Categorias" },
];

const reportTabs = [
  { to: "/relatorios", label: "Visão geral", end: true },
  { to: "/relatorios/calendario", label: "Calendário" },
];

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground-muted">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        Carregando...
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route
                path="/lancamentos"
                element={<SectionLayout label="Seções de lançamentos" tabs={transactionTabs} />}
              >
                <Route index element={<TransactionsPage />} />
                <Route path="recorrentes" element={<RecurringSchedulesPage />} />
                <Route path="categorias" element={<CategoriesPage />} />
              </Route>

              <Route path="/metas" element={<GoalsPage />} />

              <Route
                path="/relatorios"
                element={<SectionLayout label="Seções de relatórios" tabs={reportTabs} />}
              >
                <Route index element={<ReportsPage />} />
                <Route path="calendario" element={<FinancialCalendarPage />} />
              </Route>

              <Route path="/notificacoes" element={<NotificationsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />

              {/* Endereços antigos continuam funcionando. */}
              <Route path="/categorias" element={<Navigate to="/lancamentos/categorias" replace />} />
              <Route path="/recorrencias" element={<Navigate to="/lancamentos/recorrentes" replace />} />
              <Route path="/calendario" element={<Navigate to="/relatorios/calendario" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
