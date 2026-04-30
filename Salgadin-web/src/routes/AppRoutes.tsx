import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "../components/AppShell";

const HomePage = lazy(() => import("../pages/HomePage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const CategoriesPage = lazy(() => import("../pages/CategoriesPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const GoalsPage = lazy(() => import("../pages/GoalsPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/85 px-4 py-3 text-sm text-foreground-muted shadow-[0_12px_30px_rgba(60,42,32,0.08)]">
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

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/categorias" element={<CategoriesPage />} />
              <Route path="/metas" element={<GoalsPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="/notificacoes" element={<NotificationsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
