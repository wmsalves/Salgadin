import { Link } from "react-router-dom";

const buttonStyles = {
  primary:
    "rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 shadow font-semibold transition-colors",
  secondary:
    "rounded-full border border-black/10 px-5 py-2.5 hover:bg-black/5 font-semibold transition-colors",
};

export function CtaSection() {
  return (
    <section className="mt-6 bg-gradient-to-tr from-amber-200 via-emerald-100 to-emerald-200">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h3 className="text-3xl font-extrabold text-emerald-700">
          Pronto para assumir o controle?
        </h3>
        <p className="mt-3 text-gray-700 max-w-2xl mx-auto">
          Diga adeus às planilhas complicadas e olá para a clareza financeira.
          Comece a usar o Salgadin gratuitamente e veja seu dinheiro render
          mais.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className={buttonStyles.primary}>
            Criar minha conta grátis
          </Link>
          <Link to="/login" className={buttonStyles.secondary}>
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </section>
  );
}
