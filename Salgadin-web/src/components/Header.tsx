import { useState } from "react";
import { Menu, X } from "lucide-react";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#fff8e6]/80 backdrop-blur border-b border-black/5 relative">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4 relative">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src={LogoSalgadin} alt="Logo" className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-amber-600">Salga</span>
            <span className="text-emerald-600">din</span>
          </span>
        </a>

        {/* Menu Desktop */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-emerald-700">
            Recursos
          </a>
          <a href="#how" className="hover:text-emerald-700">
            Como funciona
          </a>
          <a href="#pricing" className="hover:text-emerald-700">
            Preços
          </a>
          <a href="#faq" className="hover:text-emerald-700">
            FAQ
          </a>
        </nav>

        {/* Botões Desktop */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          <a
            href="/login"
            className="rounded-full px-4 py-2 text-sm border hover:bg-black/5 transition"
          >
            Entrar
          </a>
          <a
            href="/signup"
            className="rounded-full px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow"
          >
            Começar grátis
          </a>
        </div>

        {/* Botão Mobile */}
        <button
          className="ml-auto md:hidden p-2 rounded-md hover:bg-black/5 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full -mt-px bg-white shadow-md flex flex-col items-center gap-4 py-5 z-50">
          <a href="#features" className="hover:text-emerald-700">
            Recursos
          </a>
          <a href="#how" className="hover:text-emerald-700">
            Como funciona
          </a>
          <a href="#pricing" className="hover:text-emerald-700">
            Preços
          </a>
          <a href="#faq" className="hover:text-emerald-700">
            FAQ
          </a>
          <div className="w-full px-4 mt-2 pt-2 border-t border-black/5 flex flex-col gap-2">
            <a
              href="/login"
              className="w-full text-center rounded-full px-4 py-2 text-sm border hover:bg-black/5"
            >
              Entrar
            </a>
            <a
              href="/signup"
              className="w-full text-center rounded-full px-4 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow"
            >
              Começar grátis
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
