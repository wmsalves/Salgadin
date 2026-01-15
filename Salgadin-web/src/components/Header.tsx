import { useState } from "react";
import { Menu, X, LogOut, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const navLinks = [
  { href: "/#features", label: "Recursos" },
  { href: "/#how", label: "Como funciona" },
  { href: "/#pricing", label: "Preços" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4 relative">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={handleLinkClick}
        >
          <img src={LogoSalgadin} alt="Logo" className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight hidden sm:inline">
            <span className="bg-gradient-to-r from-amber-500 to-emerald-500 bg-clip-text text-transparent">
              Salgadin
            </span>
          </span>
        </Link>

        {/* Menu Desktop */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`${
                theme === "dark"
                  ? "text-slate-200 hover:text-emerald-400"
                  : "text-slate-700 hover:text-emerald-600"
              } transition-colors`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Botões Desktop */}
        <div className="ml-auto hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Mudar para ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-600 font-medium">
                Olá, {user?.name}
              </span>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all ${
                  theme === "dark"
                    ? "text-slate-200 border-slate-700 hover:bg-slate-800"
                    : "text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Entrar
              </a>
              <a
                href="/signup"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-emerald-500 hover:shadow-lg transition-all"
              >
                Começar grátis
              </a>
            </>
          )}
        </div>

        {/* Botão Mobile */}
        <div className="ml-auto md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Mudar para ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-slate-800/50 transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Animado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <nav className="flex flex-col items-center gap-4 py-6 px-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="w-full px-2 py-2">
                <div className="h-px bg-slate-300" />
              </div>

              <div className="w-full flex flex-col gap-2 px-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      handleLinkClick();
                    }}
                    className="w-full text-center rounded-lg px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Sair
                  </button>
                ) : (
                  <>
                    <a
                      href="/login"
                      onClick={handleLinkClick}
                      className="w-full text-center rounded-lg px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      Entrar
                    </a>
                    <a
                      href="/signup"
                      onClick={handleLinkClick}
                      className="w-full text-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-emerald-500 hover:shadow-lg transition-all"
                    >
                      Começar grátis
                    </a>
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
