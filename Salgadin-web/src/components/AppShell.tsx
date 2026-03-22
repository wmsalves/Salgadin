import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutGrid,
  Tags,
  User,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatorios", icon: BarChart3 },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] text-foreground">
      <div className="flex">
        <aside
          className={clsx(
            "sticky top-0 h-screen border-r border-border/70 bg-surface/80 backdrop-blur-xl transition-all shadow-[10px_0_30px_rgba(60,42,32,0.06)]",
            collapsed ? "w-20" : "w-64"
          )}
        >
          <div
            className={clsx(
              "flex items-center px-4 py-5",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/15 text-primary grid place-items-center">
                  <img src={LogoSalgadin} alt="Logo" className="h-6 w-6" />
                </div>
                <div className="text-lg font-semibold text-foreground">
                  Salgadin
                </div>
              </div>
            )}
            <button
              className={clsx(
                "h-9 w-9 rounded-full border border-border bg-surface-2 text-foreground-muted shadow-sm transition",
                "hover:text-foreground hover:border-surface-3 hover:bg-surface-3",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "grid place-items-center leading-none"
              )}
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Alternar sidebar"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="px-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "w-full flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-surface-2 text-primary shadow-[0_10px_20px_rgba(60,42,32,0.08)]"
                        : "text-foreground-muted hover:text-foreground hover:bg-surface-2"
                    )
                  }
                >
                  <span className="h-9 w-9 rounded-full bg-surface-2 text-primary grid place-items-center">
                    <Icon size={18} />
                  </span>
                  {!collapsed && item.label}
                </NavLink>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="mt-6 px-4">
              <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-[var(--brand-from)]/10 to-[var(--brand-to)]/15 p-4 text-sm text-foreground-muted">
                <p className="font-semibold text-foreground">
                  Hora de cuidar do bolso
                </p>
                <p className="mt-1">
                  Defina metas e acompanhe seus gastos em segundos.
                </p>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(60,42,32,0.08)]">
            <div className="px-6 lg:px-8 py-3 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-foreground-muted">
                <span>Bem-vindo</span>
                <span className="font-semibold text-foreground">{user?.name}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full border border-border text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                  title={`Mudar para ${theme === "light" ? "dark" : "light"} mode`}
                >
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-full border border-border text-foreground-muted hover:text-danger hover:bg-surface-2 transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          <section className="p-6 lg:p-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
