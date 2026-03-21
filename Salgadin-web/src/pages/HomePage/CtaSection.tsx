import { Link } from "react-router-dom";

const buttonStyles = {
  primary:
    "rounded-full bg-primary hover:bg-primary-strong text-white px-5 py-2.5 shadow font-semibold transition-colors",
  secondary:
    "rounded-full border border-border px-5 py-2.5 hover:bg-surface-2 font-semibold transition-colors text-foreground-muted",
};

export function CtaSection() {
  return (
    <section className="mt-6 bg-surface-2">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h3 className="text-3xl font-extrabold text-foreground">
          Pronto para assumir o controle?
        </h3>
        <p className="mt-3 text-foreground-muted max-w-2xl mx-auto">
          Diga adeus as planilhas complicadas e ola para a clareza financeira.
          Comece a usar o Salgadin gratuitamente e veja seu dinheiro render
          mais.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className={buttonStyles.primary}>
            Criar minha conta gratis
          </Link>
          <Link to="/login" className={buttonStyles.secondary}>
            Ja tenho uma conta
          </Link>
        </div>
      </div>
    </section>
  );
}
