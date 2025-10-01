import { useState } from "react";

// SVGs usados nesta página
import WalletIcon from "../assets/solar_wallet-outline.svg";
import ControllerIcon from "../assets/vaadin_controller.svg";
import ReportIcon from "../assets/Vector.svg";
import GoalIcon from "../assets/octicon_goal-16.svg";

// Componentes
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function HomePage() {
  type TabKey = "Dashboard" | "Despesas" | "Metas";
  const [activeTab, setActiveTab] = useState<TabKey>("Dashboard");

  return (
    <div className="min-h-screen bg-[#fff8e6] text-slate-800">
      {/* Topbar */}
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-10">
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-emerald-600">
          Gerencie suas finanças com
          <br className="hidden sm:block" />
          <span className="text-emerald-700"> simplicidade e eficiência</span>
        </h1>
        <p className="mt-4 text-center max-w-2xl mx-auto text-sm sm:text-base text-gray-600">
          O Salgadin é a plataforma completa para controle de custos e despesas
          que vai transformar sua vida financeira. Organize, planeje e economize
          com facilidade.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/signup"
            className="rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 px-4 sm:px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-95"
          >
            Começar Gratuitamente
          </a>
          <a
            href="#how"
            className="rounded-full border border-black/10 px-4 sm:px-5 py-2.5 text-sm font-medium hover:bg-black/5"
          >
            Ver como funciona
          </a>
        </div>

        {/* gráfico placeholder */}
        <div className="relative mt-10">
          <div className="mx-auto h-[360px] w-full max-w-5xl rounded-2xl border border-black/10 bg-white shadow-inner grid place-items-center text-gray-400">
            <span className="text-sm">(Gráfico)</span>
          </div>

          {/* badges */}
          <div className="absolute -right-2 -top-3 rotate-2">
            <div className="rounded-xl border bg-white shadow px-3 py-1.5 text-[11px]">
              <div className="font-semibold text-emerald-600">
                Economia do mês
              </div>
              <div className="font-bold">R$ 1.250,00</div>
            </div>
          </div>
          <div className="absolute -left-2 -bottom-4 -rotate-2">
            <div className="rounded-xl border bg-white shadow px-3 py-1.5 text-[11px]">
              <div className="font-semibold text-amber-600">Metas do mês</div>
              <div className="font-bold">3 de 5</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
          Tudo o que você precisa para gerenciar
          <br className="hidden sm:block" /> suas finanças
        </h2>
        <p className="mt-3 text-center max-w-3xl mx-auto text-gray-600 text-sm sm:text-base">
          O Salgadin oferece ferramentas poderosas e intuitivas para ajudar você
          a controlar seus gastos, economizar dinheiro e alcançar seus objetivos
          financeiros.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Controle de Despesas",
              desc: "Acompanhe todos os seus gastos em um só lugar, com categorização automática e análise detalhada.",
              icon: WalletIcon,
            },
            {
              title: "Orçamento Inteligente",
              desc: "Crie orçamentos personalizados e receba alertas quando estiver próximo de atingir seus limites.",
              icon: ControllerIcon,
            },
            {
              title: "Relatórios Detalhados",
              desc: "Visualize sua saúde financeira com gráficos e relatórios personalizados e fáceis de entender.",
              icon: ReportIcon,
            },
            {
              title: "Metas Financeiras",
              desc: "Estabeleça metas de economia e acompanhe seu progresso com visualizações claras e motivadoras.",
              icon: GoalIcon,
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-full">
                  <img src={f.icon} alt={f.title} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona (com abas) */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
          Como o <span className="text-amber-600">Salgad</span>
          <span className="text-emerald-600">in</span> funciona?
        </h2>
        <p className="mt-2 text-center text-gray-600 text-sm sm:text-base">
          Comece a organizar suas finanças em minutos com nossa plataforma
          intuitiva e fácil de usar.
        </p>

        {/* Abas */}
        <div
          role="tablist"
          aria-label="Como funciona - abas"
          className="mt-6 flex justify-center gap-2 sm:gap-4 text-sm"
        >
          {(["Dashboard", "Despesas", "Metas"] as const).map((t) => {
            const selected = activeTab === t;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${t}`}
                onClick={() => setActiveTab(t)}
                className={[
                  "rounded-full border px-4 py-1.5 transition",
                  selected
                    ? "bg-black/5 ring-1 ring-black/10"
                    : "hover:bg-black/5",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Conteúdo */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Lado esquerdo: textos */}
          <div className="space-y-3 text-sm sm:text-base">
            {activeTab === "Dashboard" && (
              <>
                <h3 className="text-2xl font-extrabold">
                  Visualize tudo em um só lugar
                </h3>
                <p className="text-gray-600">
                  O dashboard principal do Salgadin oferece uma visão completa
                  da sua saúde financeira. Veja seus gastos, receitas, economias
                  e metas em um único painel intuitivo.
                </p>
                <ul className="space-y-4 text-gray-700">
                  <li>✓ Resumo financeiro atualizado em tempo real</li>
                  <li>✓ Gráficos interativos para análise rápida</li>
                  <li>✓ Alertas personalizados sobre gastos excessivos</li>
                </ul>
              </>
            )}

            {activeTab === "Despesas" && (
              <>
                <h3 className="text-2xl font-extrabold">
                  Controle total das suas despesas
                </h3>
                <p className="text-gray-600">
                  Registre e categorize seus gastos&nbsp;facilmente. O Salgadin
                  organiza automaticamente suas despesas e mostra exatamente
                  para onde seu dinheiro está indo.
                </p>
                <ul className="space-y-4 text-gray-700">
                  <li>✓ Categorização automática de despesas</li>
                  <li>✓ Comparação de gastos mês a mês</li>
                  <li>✓ Filtros avançados para análise detalhada</li>
                </ul>
              </>
            )}

            {activeTab === "Metas" && (
              <>
                <h3 className="text-2xl font-extrabold">
                  Alcance seus objetivos financeiros
                </h3>
                <p className="text-gray-600">
                  Defina metas claras e acompanhe seu&nbsp;progresso. O Salgadin
                  ajuda você a economizar para o que realmente importa, seja uma
                  viagem, um carro novo ou a sua independência financeira.
                </p>
                <ul className="space-y-4 text-gray-700">
                  <li>✓ Criação de metas personalizadas</li>
                  <li>✓ Acompanhamento visual do progresso</li>
                  <li>
                    ✓ Sugestões de economia para atingir metas mais rápido
                  </li>
                </ul>
              </>
            )}
          </div>

          {/* Lado direito: mock box */}
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={activeTab}
            className="h-[360px] md:h-[420px] rounded-2xl border border-black/20 bg-gray-200 shadow-inner p-4 grid place-items-center text-gray-500"
          >
            {activeTab === "Dashboard" && (
              <span className="text-sm">(Painel)</span>
            )}
            {activeTab === "Despesas" && (
              <span className="text-sm">(Painel)</span>
            )}
            {activeTab === "Metas" && <span className="text-sm">(Painel)</span>}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
          Perguntas Frequentes
        </h2>
        <p className="mt-2 text-center text-gray-600 text-sm sm:text-base">
          Encontre respostas para as dúvidas mais comuns sobre o Salgadin.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            {
              q: "Como o Salgadin protege meus dados financeiros?",
              a: "Usamos criptografia de ponta a ponta, padrões rigorosos de segurança e servidores confiáveis. Nunca compartilhamos informações sem permissão.",
            },
            {
              q: "Preciso ter conhecimentos financeiros para usar?",
              a: "Não. A experiência é simples e guiada, com recursos educativos para ajudar a melhorar sua educação financeira.",
            },
            {
              q: "Funciona em todos os dispositivos?",
              a: "Sim. Web, iOS e Android (em breve). Acesse de qualquer dispositivo e tenha seus dados sempre sincronizados.",
            },
            {
              q: "Posso usar para gerenciar finanças da minha empresa?",
              a: "O foco é pessoa física, mas há recursos para autônomos e pequenos negócios (relatórios e separação por categorias).",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="font-medium">{item.q}</div>
              <p className="mt-1 text-sm text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-6 bg-gradient-to-tr from-amber-200 via-emerald-100 to-emerald-200">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h3 className="text-2xl font-extrabold text-emerald-700">
            Comece a transformar suas finanças hoje
          </h3>
          <p className="mt-2 text-gray-700 max-w-2xl mx-auto text-sm sm:text-base">
            Junte-se a milhares de pessoas que já estão economizando e
            alcançando seus objetivos financeiros com o Salgadin.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <a
              href="/signup"
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 shadow"
            >
              Criar conta grátis
            </a>
            <a
              href="/login"
              className="rounded-full border border-black/10 px-5 py-2.5 hover:bg-black/5"
            >
              Fazer login
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
