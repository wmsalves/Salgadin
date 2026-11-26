import { useState } from "react";
import { Menu, X, LogOut, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import logo from "../assets/logo.svg";
import { dropdownMotion, getMotionProps, MOTION } from "../lib/motion";

const navLinks = [
  { id: "features", label: "Recursos" },
  { id: "efeito", label: "Efeito coxinha" },
  { id: "pricing", label: "Preços" },
  { id: "faq", label: "FAQ" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = Boolean(useReducedMotion());

  const handleLinkClick = (id?: string) => {
    setIsOpen(false);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const headerOffset = 96;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background relative">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center gap-4 px-4 py-3 relative">
        <Link
          to="/"
          className="ui-surface-interactive flex min-h-11 items-center gap-3 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onClick={() => handleLinkClick()}
        >
          <img
            src={logo}
            alt=""
            width="46"
            height="46"
            decoding="async"
            className="h-11 w-auto object-contain"
            aria-hidden="true"
          />
          <span className="text-2xl font-medium hidden sm:inline text-foreground">
            <span className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">
              Salgadin
            </span>
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              className="ui-surface-interactive min-h-11 rounded-xl px-4 py-2 text-foreground-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="ui-surface-interactive grid h-11 w-11 place-items-center rounded-xl text-foreground-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            title={`Mudar para modo ${theme === "light" ? "escuro" : "claro"}`}
            aria-label={`Mudar para modo ${theme === "light" ? "escuro" : "claro"}`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <span className="text-sm text-foreground-muted font-medium bg-surface-2 px-3 py-1.5 rounded-full">
                Ola, {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="ui-surface-interactive grid h-11 w-11 place-items-center rounded-xl border border-border text-sm text-foreground-muted hover:border-surface-3 hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                title="Sair"
                aria-label="Sair"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="ui-surface-interactive inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-4 py-2 text-sm font-medium text-[var(--color-on-primary)] ui-pressable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Começar grátis
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="ui-surface-interactive grid h-11 w-11 place-items-center rounded-xl text-foreground-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            title={`Mudar para modo ${theme === "light" ? "escuro" : "claro"}`}
            aria-label={`Mudar para modo ${theme === "light" ? "escuro" : "claro"}`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            className="ui-surface-interactive grid h-11 w-11 place-items-center rounded-xl hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...getMotionProps(shouldReduceMotion, dropdownMotion, {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            })}
            transition={shouldReduceMotion ? { duration: 0 } : MOTION.smooth}
            className="ui-popover-panel absolute left-0 right-0 top-full border-t border-border bg-surface lg:hidden shadow-[var(--shadow-overlay)]"
            id="mobile-navigation"
          >
            <nav className="flex flex-col items-stretch gap-2 px-4 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleLinkClick(link.id)}
                  className="ui-surface-interactive min-h-11 rounded-xl px-4 py-2 text-left font-medium text-foreground-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {link.label}
                </button>
              ))}

              <div className="w-full px-2 py-2">
                <div className="h-px bg-border" />
              </div>

              <div className="w-full flex flex-col gap-2 px-2">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      handleLinkClick();
                    }}
                    className="ui-surface-interactive min-h-11 w-full rounded-xl border border-border px-4 py-2 text-center text-sm font-medium text-foreground-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Sair
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => handleLinkClick()}
                      className="ui-surface-interactive inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 py-2 text-center text-sm font-medium text-foreground-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => handleLinkClick()}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-4 py-2 text-center text-sm font-medium text-[var(--color-on-primary)] ui-pressable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Começar grátis
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
