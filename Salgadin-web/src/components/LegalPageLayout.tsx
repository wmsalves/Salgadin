import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

type LegalSection = {
  title: string;
  content: ReactNode;
};

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:pb-20 sm:pt-14">
        <section className="rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8">
          <p className="text-sm font-medium text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-medium text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-foreground-muted">
            {description}
          </p>
          <p className="mt-4 text-sm text-foreground-subtle">
            Ultima atualizacao: {updatedAt}
          </p>
        </section>

        <div className="mt-6 space-y-4 sm:mt-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8"
            >
              <h2 className="text-xl font-medium text-foreground sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-foreground-muted sm:text-base">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
