import clsx from "clsx";
import { NavLink, Outlet } from "react-router-dom";

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
                    "relative -mb-px inline-flex min-h-10 items-center whitespace-nowrap border-b-2 px-3 text-ui font-medium transition-colors",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-foreground-muted hover:text-foreground",
                  )
                }
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
