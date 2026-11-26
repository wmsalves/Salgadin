import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  ReceiptText,
  User,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  Target,
  ChevronLeft,
  ChevronRight,
  Bell,
  ChevronDown,
  LogOutIcon,
  Menu,
  Settings2,
} from "lucide-react";
import clsx from "clsx";
import logo from "../assets/logo.svg";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";
import type { NotificationItem } from "../lib/types";
import { dropdownMotion, indicatorTransition, MOTION, pageMotion } from "../lib/motion";

// Cinco destinos principais. Categorias e Recorrentes ficam dentro de
// Lançamentos; Calendário fica dentro de Relatórios; Notificações no sino.
const navItems = [
  { to: "/dashboard", label: "Início", icon: LayoutGrid },
  { to: "/lancamentos", label: "Lançamentos", icon: ReceiptText },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/perfil", label: "Conta", icon: User },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isLoadingBell, setIsLoadingBell] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );
  const homePath = "/dashboard";
  const firstName = useMemo(
    () => user?.name?.trim().split(" ")[0] ?? "você",
    [user?.name],
  );
  const userInitial = useMemo(
    () => user?.name?.trim().charAt(0).toUpperCase() ?? "U",
    [user?.name],
  );

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

  useEffect(() => {
    setIsBellOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <motion.aside
          animate={{ width: collapsed ? 80 : 256 }}
          transition={MOTION.panel}
          className="sticky top-0 h-screen border-r border-border bg-surface hidden md:flex md:flex-col relative"
        >
          <div className="relative flex items-center justify-center px-4 py-5">
            <NavLink
              to={homePath}
              className={clsx(
                "ui-surface-interactive flex min-h-11 items-center gap-3 rounded-xl hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
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
                <span className="text-2xl font-medium text-foreground">
                  <span className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
                    Salgadin
                  </span>
                </span>
              )}
            </NavLink>
          </div>

          <button
            className={clsx(
              "absolute right-0 top-1/2 z-20 hidden h-16 w-8 -translate-y-1/2 translate-x-1/2 rounded-full border border-border bg-surface text-foreground-muted transition md:grid place-items-center soft-press",
              "hover:text-foreground hover:border-surface-3 hover:bg-surface-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            <span className="pointer-events-none flex h-10 w-5 items-center justify-center rounded-full border border-border bg-surface-2/80">
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </span>
          </button>

          <nav className={clsx("px-3 space-y-2", collapsed ? "mt-6" : "mt-2")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-foreground-muted hover:bg-surface-2/70 hover:text-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                  <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      transition={indicatorTransition}
                      className="absolute inset-0 -z-0 rounded-xl bg-surface-2"
                      aria-hidden
                    />
                  )}
                  <span
                    className={clsx(
                      "relative grid h-9 w-9 place-items-center rounded-full transition-colors",
                      isActive ? "text-primary" : "text-foreground-subtle",
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        key={item.label}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={MOTION.micro}
                        className="relative"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  </>
                  )}
                </NavLink>
              );
            })}
          </nav>

        </motion.aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-border bg-surface">
            <div className="px-6 lg:px-8 py-3 flex items-center gap-3">
              <NavLink
                to={homePath}
                className="ui-surface-interactive md:hidden flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
                <span className="text-xl font-medium text-foreground">
                  <span className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
                    Salgadin
                  </span>
                </span>
              </NavLink>
              <div className="hidden items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-foreground-muted md:flex">
                <span>Bem-vindo</span>
                <span className="font-medium text-foreground">
                  {user?.name}
                </span>
              </div>
              <div className="ml-auto hidden items-center gap-2 md:flex">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsBellOpen((prev) => !prev);
                      if (!isBellOpen) {
                        fetchNotifications(false);
                      }
                    }}
                    className="ui-surface-interactive relative rounded-full border border-border p-2 text-foreground-muted hover:bg-surface-2 hover:text-foreground soft-press"
                    title="Notificações"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-danger text-[var(--color-on-primary)] text-xs font-medium grid place-items-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isBellOpen && (
                    <motion.div
                      {...dropdownMotion}
                      transition={MOTION.smooth}
                      className="ui-popover-panel absolute left-1/2 z-50 mt-3 max-h-[360px] w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-auto rounded-2xl border border-border bg-surface md:left-auto md:right-0 md:w-80 md:translate-x-0 shadow-[var(--shadow-overlay)]"
                    >
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          Notificações
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
                            Nenhuma notificação no momento.
                          </p>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-border bg-surface-2 p-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-foreground">
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
                                    className="text-xs text-primary hover:text-primary/80"
                                  >
                                    Marcar lido
                                  </button>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-foreground-subtle">
                                {item.message}
                              </p>
                              <p className="mt-2 text-xs text-foreground-muted">
                                {new Date(item.createdAt).toLocaleString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={toggleTheme}
                  className="ui-surface-interactive rounded-full border border-border p-2 text-foreground-muted hover:bg-surface-2 hover:text-foreground soft-press"
                  title={`Mudar para ${theme === "light" ? "dark" : "light"} mode`}
                >
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button
                  onClick={logout}
                  className="ui-surface-interactive rounded-full border border-border p-2 text-foreground-muted hover:bg-surface-2 hover:text-danger soft-press"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
              <div className="ml-auto md:hidden">
                <div className="relative">
                  <button
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="ui-surface-interactive flex items-center gap-2 rounded-full border border-border bg-surface-2 px-2.5 py-2 text-foreground hover:bg-surface-3 soft-press"
                    aria-label="Abrir menu da conta"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-medium text-[var(--color-on-primary)]">
                      {userInitial}
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/12 text-primary">
                      <Menu size={16} />
                    </span>
                    <ChevronDown
                      size={16}
                      className={clsx(
                        "text-foreground-muted transition-transform",
                        isMobileMenuOpen && "rotate-180",
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileMenuOpen && (
                    <motion.div
                      {...dropdownMotion}
                      transition={MOTION.smooth}
                      className="ui-popover-panel absolute right-0 z-50 mt-3 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-overlay)]"
                    >
                      <div className="border-b border-border bg-surface-2 px-4 py-3">
                        <div className="text-xs text-foreground-muted">Conta</div>
                        <div className="mt-1 text-sm font-medium text-foreground">
                          {firstName}
                        </div>
                        <div className="mt-0.5 text-xs text-foreground-muted">
                          {user?.email}
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            setIsBellOpen((prev) => !prev);
                            if (!isBellOpen) {
                              fetchNotifications(false);
                            }
                          }}
                          className="ui-surface-interactive flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-foreground hover:bg-surface-2"
                        >
                          <span className="flex items-center gap-3">
                            <Bell size={16} className="text-foreground-muted" />
                            Notificações
                          </span>
                          <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-medium text-[var(--color-on-primary)]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        </button>

                        {isBellOpen && (
                          <div className="mt-2 rounded-xl border border-border bg-surface-2 p-3">
                            {isLoadingBell ? (
                              <p className="text-sm text-foreground-subtle">
                                Carregando...
                              </p>
                            ) : notifications.length === 0 ? (
                              <p className="text-sm text-foreground-subtle">
                                Nenhuma notificação no momento.
                              </p>
                            ) : (
                              <div className="max-h-64 space-y-3 overflow-auto">
                                {notifications.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-xl border border-border bg-surface px-3 py-2.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-medium text-foreground">
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
                                                  : n,
                                              ),
                                            );
                                          }}
                                          className="text-xs text-primary"
                                        >
                                          Marcar lido
                                        </button>
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-foreground-subtle">
                                      {item.message}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={toggleTheme}
                          className="ui-surface-interactive mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground hover:bg-surface-2"
                        >
                          <Settings2 size={16} className="text-foreground-muted" />
                          Tema: {theme === "light" ? "claro" : "escuro"}
                        </button>

                        <button
                          onClick={logout}
                          className="ui-surface-interactive mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-danger hover:bg-danger/10"
                        >
                          <LogOutIcon size={16} />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <ShellOutlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl py-1 text-xs font-medium tracking-[-0.01em] transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-foreground-muted hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-active"
                        transition={indicatorTransition}
                        className="absolute -top-1.5 h-0.5 w-8 rounded-full bg-primary"
                        aria-hidden
                      />
                    )}
                    <span className="grid h-8 w-8 place-items-center">
                      <Icon size={20} />
                    </span>
                    <span className="whitespace-nowrap text-center">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

const ShellOutlet = memo(function ShellOutlet() {
  const { pathname } = useLocation();
  // Abas da mesma secao (ex.: /lancamentos e /lancamentos/categorias) nao
  // reanimam o layout inteiro; so a troca de secao anima a entrada.
  const sectionKey = pathname.split("/")[1] ?? "";
  return (
    <section className="p-6 lg:p-8 pb-24 md:pb-8">
      <motion.div key={sectionKey} {...pageMotion}>
        <Outlet />
      </motion.div>
    </section>
  );
});
