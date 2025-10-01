import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";

const navLinks = [
  { href: "/#features", label: "Recursos" },
  { href: "/#how", label: "Como funciona" },
  { href: "/#pricing", label: "Preços" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fff8e6]/80 backdrop-blur border-b border-black/5">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={handleLinkClick}
        >
          <img src={LogoSalgadin} alt="Logo" className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-amber-600">Salga</span>
            <span className="text-emerald-600">din</span>
          </span>
        </Link>

        {/* Menu Desktop */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-emerald-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Botões Desktop */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm border hover:bg-black/5 transition"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="rounded-full px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow"
          >
            Começar grátis
          </Link>
        </div>

        {/* Botão Mobile */}
        <button
          className="ml-auto md:hidden p-2 rounded-md hover:bg-black/5 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <nav className="md:hidden absolute left-0 right-0 top-full bg-white shadow-md flex flex-col items-center gap-4 py-5 z-50">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="hover:text-emerald-700"
            >
              {link.label}
            </a>
          ))}
          <div className="w-full px-4 mt-2 pt-4 border-t border-black/5 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={handleLinkClick}
              className="w-full text-center rounded-full px-4 py-2 text-sm border hover:bg-black/5"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              onClick={handleLinkClick}
              className="w-full text-center rounded-full px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow"
            >
              Começar grátis
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
