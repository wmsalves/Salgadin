import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

import { ProtectedRoute } from "./ProtectedRoute";
import CategoriesPage from "../pages/CategoriesPage";
import { AppShell } from "../components/AppShell";
import ProfilePage from "../pages/ProfilePage";
import ReportsPage from "../pages/ReportsPage";
import GoalsPage from "../pages/GoalsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/metas" element={<GoalsPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
