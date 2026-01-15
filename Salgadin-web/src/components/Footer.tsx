import { Twitter, Instagram } from "lucide-react";
import LogoSalgadin from "../assets/Logo_Salgadin.svg";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-emerald-500/5 dark:bg-emerald-950/20 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 text-center sm:text-left">
          {/* Coluna Esquerda: Logo */}
          <div className="flex justify-center sm:justify-start">
            <Link to="/" className="flex items-center gap-2">
              <img src={LogoSalgadin} alt="Logo Salgadin" className="h-8 w-8" />
              <span className="font-bold text-lg">
                <span className="text-amber-600">Salga</span>
                <span className="text-emerald-600">din</span>
              </span>
            </Link>
          </div>

          {/* Coluna Central: Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <Link
              to="/termos"
              className="hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              Termos
            </Link>
            <Link
              to="/privacidade"
              className="hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              Privacidade
            </Link>
            <Link
              to="/contato"
              className="hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              Contato
            </Link>
          </div>

          {/* Coluna Direita: Redes Sociais */}
          <div className="flex justify-center sm:justify-end items-center gap-4">
            <a
              href="#"
              aria-label="Twitter"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>

        {/* Linha divisória e Copyright */}
        <div className="mt-8 border-t border-black/10 dark:border-white/10 pt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          © {new Date().getFullYear()} Salgadin. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
