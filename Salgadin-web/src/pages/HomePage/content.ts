import { Wallet, SlidersHorizontal, BarChart3, Target } from "lucide-react";

export const features = [
  {
    title: "Controle de Despesas",
    desc: "Registre cafés, lanches, delivery, mercado e transporte em um só lugar, com categorias fáceis de ajustar.",
    icon: Wallet,
    colorTheme: "emerald",
  },
  {
    title: "Orçamento Inteligente",
    desc: "Defina limites simples para o mês e acompanhe quando os pequenos gastos começam a pesar.",
    icon: SlidersHorizontal,
    colorTheme: "amber",
  },
  {
    title: "Relatórios Detalhados",
    desc: "Veja padrões em gráficos claros, sem precisar montar planilhas ou interpretar números soltos.",
    icon: BarChart3,
    colorTheme: "emerald",
  },
  {
    title: "Metas Financeiras",
    desc: "Acompanhe metas pessoais com progresso visual e decisões mais fáceis no dia a dia.",
    icon: Target,
    colorTheme: "amber",
  },
];

export const faqItems = [
  {
    q: "Como o Salgadin protege meus dados financeiros?",
    a: "O Salgadin organiza suas informações com cuidado e segue boas práticas de privacidade. A proposta é dar clareza sobre seus próprios lançamentos, sem vender a ideia de acesso bancário automático ou integrações que o produto ainda não oferece.",
  },
  {
    q: "Preciso ter conhecimentos financeiros para usar?",
    a: "Não. A experiência foi pensada para quem quer entender o básico com clareza: registrar uma despesa, escolher uma categoria e ver o padrão aparecer nos gráficos.",
  },
  {
    q: "Funciona em todos os meus dispositivos?",
    a: "Sim. O Salgadin é uma plataforma web responsiva, feita para funcionar bem no computador, tablet e celular.",
  },
  {
    q: "Posso usar para gerenciar finanças da minha empresa?",
    a: "O Salgadin foi projetado com foco total nas finanças pessoais. No entanto, muitos autônomos e freelancers o utilizam com sucesso para ter um controle simplificado de suas receitas e despesas. Você pode criar categorias específicas para o seu negócio e gerar relatórios que ajudam a ter uma visão clara do fluxo de caixa e a separar os gastos pessoais dos profissionais.",
  },
];

export const tabsContent = {
  Dashboard: {
    title: "Visualize tudo em um só lugar",
    description:
      "O painel principal reúne seus lançamentos, categorias e metas em uma visão simples. A ideia é mostrar o que mudou no mês sem transformar sua rotina em planilha.",
    items: [
      "Resumo financeiro organizado para decisões mais seguras",
      "Gráficos interativos com leitura rápida e foco no essencial",
      "Alertas personalizados quando um gasto foge do planejado",
    ],
  },
  Despesas: {
    title: "Registre despesas sem complicação",
    description:
      "O fluxo atual é manual: você adiciona o gasto, escolhe uma categoria e acompanha o impacto no mês. É direto para cafés, lanches, delivery, mercado, transporte e compras recorrentes.",
    items: [
      "Categorias rápidas, filtros simples e visão por período",
      "Exportação em CSV ou PDF para compartilhar quando precisar",
      "Detalhamento por item para cortes mais inteligentes",
    ],
  },
  Metas: {
    title: "Alcance seus objetivos financeiros",
    description:
      "Defina metas que fazem sentido para você e acompanhe o progresso com clareza. Visualize o avanço mês a mês e saiba exatamente o que falta para chegar lá.",
    items: [
      "Metas gerais ou por categoria com acompanhamento visual",
      "Alertas antes de estourar o limite planejado",
      "Progresso claro para manter o ritmo e motivação",
    ],
  },
};
