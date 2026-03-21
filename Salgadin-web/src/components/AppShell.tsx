import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, Tags, User, BarChart3, LogOut, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/relatorios", label: "Relatorios", icon: BarChart3 },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)]">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={LogoSalgadin} alt="Logo" className="h-9 w-9" />
            <span className="text-lg font-extrabold text-foreground">
              <span className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
                Salgadin
              </span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-2 ml-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                      isActive
                        ? "bg-surface-2 text-foreground shadow-sm"
                        : "text-foreground-muted hover:text-foreground hover:bg-surface-2"
                    )
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground-muted hover:bg-surface-2 transition-colors"
              title={`Mudar para ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-foreground-muted">
              <span>{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-foreground-muted hover:text-danger hover:bg-surface-2 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="md:hidden border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-2 flex gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition",
                      isActive
                        ? "bg-surface-2 text-foreground shadow-sm"
                        : "text-foreground-muted hover:text-foreground hover:bg-surface-2"
                    )
                  }
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
