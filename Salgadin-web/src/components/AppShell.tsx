import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
  Bell,
} from "lucide-react";
import clsx from "clsx";
import logo from "../assets/Logo.svg";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";
import type { NotificationItem } from "../lib/types";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatorios", icon: BarChart3 },
  { to: "/notificacoes", label: "Notificacoes", icon: Bell },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isLoadingBell, setIsLoadingBell] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );
  const homePath = "/dashboard";

  const fetchNotifications = useCallback(async (unreadOnly = true) => {
    setIsLoadingBell(true);
    try {
      const data = await getNotifications(unreadOnly);
      setNotifications(data);
    } finally {
      setIsLoadingBell(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] text-foreground">
      <div className="flex">
        <motion.aside
          animate={{ width: collapsed ? 80 : 256 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 h-screen border-r border-border/70 bg-surface/95 shadow-[10px_0_24px_rgba(60,42,32,0.06)] hidden md:flex md:flex-col"
        >
          <div className="relative flex items-center justify-center px-4 py-5">
            <NavLink
              to={homePath}
              className={clsx(
                "flex min-h-11 items-center gap-3 rounded-xl transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                collapsed ? "justify-center p-2" : "justify-start px-2 py-1",
              )}
            >
              <img
                src={logo}
                alt=""
                width={collapsed ? 44 : 46}
                height={collapsed ? 44 : 46}
                decoding="async"
                className={clsx(
                  "w-auto object-contain",
                  collapsed ? "h-11 max-w-[44px]" : "h-11 max-w-[46px]",
                )}
                aria-hidden="true"
              />
              {!collapsed && (
                <span className="text-2xl font-extrabold tracking-tight text-foreground">
                  <span className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
                    Salgadin
                  </span>
                </span>
              )}
            </NavLink>
            <button
              className={clsx(
                "absolute top-4 h-9 w-9 rounded-full border border-border bg-surface-2 text-foreground-muted shadow-sm transition soft-press",
                "hover:text-foreground hover:border-surface-3 hover:bg-surface-3",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "grid place-items-center leading-none",
                collapsed ? "left-1/2 -translate-x-1/2" : "right-4",
              )}
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Alternar sidebar"
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          <nav className={clsx("px-3 space-y-2", collapsed ? "mt-6" : "mt-2")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] soft-hover-sm",
                      isActive
                        ? "bg-surface-2 text-primary shadow-[0_10px_20px_rgba(60,42,32,0.08)] translate-x-1"
                        : "text-foreground-muted hover:text-foreground hover:bg-surface-2 hover:translate-x-1",
                    )
                  }
                >
                  <span className="h-9 w-9 rounded-full bg-surface-2 text-primary grid place-items-center">
                    <Icon size={18} />
                  </span>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        key={item.label}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
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
        </motion.aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/95 shadow-[0_8px_24px_rgba(60,42,32,0.08)]">
            <div className="px-6 lg:px-8 py-3 flex items-center gap-3">
              <NavLink
                to={homePath}
                className="md:hidden flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Ir para o dashboard"
              >
                <img
                  src={logo}
                  alt=""
                  width="38"
                  height="38"
                  decoding="async"
                  className="h-9 w-auto object-contain"
                  aria-hidden="true"
                />
                <span className="text-xl font-extrabold tracking-tight text-foreground">
                  <span className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
                    Salgadin
                  </span>
                </span>
              </NavLink>
              <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-foreground-muted">
                <span>Bem-vindo</span>
                <span className="font-semibold text-foreground">
                  {user?.name}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsBellOpen((prev) => !prev);
                      if (!isBellOpen) {
                        fetchNotifications(false);
                      }
                    }}
                    className="relative p-2 rounded-full border border-border text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors soft-press"
                    title="Notificacoes"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-danger text-white text-[10px] font-semibold grid place-items-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {isBellOpen && (
                    <div className="absolute right-0 mt-3 w-80 max-h-[360px] overflow-auto rounded-2xl border border-border bg-surface shadow-[0_18px_36px_rgba(0,0,0,0.18)] z-50">
                      <div className="p-4 border-b border-border/60 flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          Notificacoes
                        </span>
                        <button
                          onClick={() => setIsBellOpen(false)}
                          className="text-xs text-foreground-muted hover:text-foreground"
                        >
                          Fechar
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        {isLoadingBell ? (
                          <p className="text-sm text-foreground-subtle">
                            Carregando...
                          </p>
                        ) : notifications.length === 0 ? (
                          <p className="text-sm text-foreground-subtle">
                            Nenhuma notificacao no momento.
                          </p>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-border bg-surface-2 p-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-foreground">
                                  {item.title}
                                </span>
                                {!item.isRead && (
                                  <button
                                    onClick={async () => {
                                      await markNotificationRead(item.id);
                                      setNotifications((prev) =>
                                        prev.map((n) =>
                                          n.id === item.id
                                            ? { ...n, isRead: true }
                                            : n
                                        )
                                      );
                                    }}
                                    className="text-[11px] text-primary hover:text-primary/80"
                                  >
                                    Marcar lido
                                  </button>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] text-foreground-subtle">
                                {item.message}
                              </p>
                              <p className="mt-2 text-[10px] text-foreground-muted">
                                {new Date(item.createdAt).toLocaleString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full border border-border text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors soft-press"
                  title={`Mudar para ${theme === "light" ? "dark" : "light"} mode`}
                >
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-full border border-border text-foreground-muted hover:text-danger hover:bg-surface-2 transition-colors soft-press"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          <ShellOutlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-surface/98 shadow-[0_-8px_24px_rgba(60,42,32,0.12)] md:hidden">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
          {[
            { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
            { to: "/categorias", label: "Categorias", icon: Tags },
            { to: "/metas", label: "Metas", icon: Target },
            { to: "/relatorios", label: "Relatorios", icon: BarChart3 },
            { to: "/notificacoes", label: "Notificacoes", icon: Bell },
            { to: "/perfil", label: "Perfil", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "flex flex-col items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-xl transition",
                    isActive
                      ? "text-primary"
                      : "text-foreground-muted hover:text-foreground"
                  )
                }
              >
                <span className="h-9 w-9 rounded-full bg-surface-2 grid place-items-center">
                  <Icon size={18} />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

const ShellOutlet = memo(function ShellOutlet() {
  return (
    <section className="p-6 lg:p-8 pb-24 md:pb-8">
      <Outlet />
    </section>
  );
});
