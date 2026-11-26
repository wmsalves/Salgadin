import clsx from "clsx";
import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { indicatorTransition, pageMotion } from "../lib/motion";

export interface SectionTab {
  to: string;
  label: string;
  end?: boolean;
}

interface SectionLayoutProps {
  label: string;
  tabs: SectionTab[];
}

/** Abas de uma secao do app (ex.: Lancamentos > Recorrencias > Categorias). */
export function SectionLayout({ label, tabs }: SectionLayoutProps) {
  const { pathname } = useLocation();
  return (
    <div className="space-y-6">
      <nav aria-label={label} className="-mx-1 overflow-x-auto px-1">
        <ul className="flex w-max min-w-full gap-1 border-b border-border">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  clsx(
                    "relative inline-flex min-h-10 items-center whitespace-nowrap px-3 text-ui font-medium transition-colors",
                    isActive ? "text-foreground" : "text-foreground-muted hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {tab.label}
                    {isActive && (
                      <motion.span
                        layoutId={`${label}-tab`}
                        transition={indicatorTransition}
                        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                        aria-hidden
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <motion.div key={pathname} {...pageMotion}>
        <Outlet />
      </motion.div>
    </div>
  );
}
