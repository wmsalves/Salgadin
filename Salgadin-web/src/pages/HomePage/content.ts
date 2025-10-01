// src/pages/HomePage/content.ts
import WalletIcon from "../../assets/solar_wallet-outline.svg";
import ControllerIcon from "../../assets/vaadin_controller.svg";
import ReportIcon from "../../assets/Vector.svg";
import GoalIcon from "../../assets/octicon_goal-16.svg";

export const features = [
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
];

export const faqItems = [
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
];

// O conteúdo das abas também é movido para cá
export const tabsContent = {
  Dashboard: {
    title: "Visualize tudo em um só lugar",
    description:
      "O dashboard principal do Salgadin oferece uma visão completa da sua saúde financeira. Veja seus gastos, receitas, economias e metas em um único painel intuitivo.",
    items: [
      "Resumo financeiro atualizado em tempo real",
      "Gráficos interativos para análise rápida",
      "Alertas personalizados sobre gastos excessivos",
    ],
  },
  Despesas: {
    title: "Controle total das suas despesas",
    description:
      "Registre e categorize seus gastos facilmente. O Salgadin organiza automaticamente suas despesas e mostra exatamente para onde seu dinheiro está indo.",
    items: [
      "Categorização automática de despesas",
      "Comparação de gastos mês a mês",
      "Filtros avançados para análise detalhada",
    ],
  },
  Metas: {
    title: "Alcance seus objetivos financeiros",
    description:
      "Defina metas claras e acompanhe seu progresso. O Salgadin ajuda você a economizar para o que realmente importa, seja uma viagem, um carro novo ou a sua independência financeira.",
    items: [
      "Criação de metas personalizadas",
      "Acompanhamento visual do progresso",
      "Sugestões de economia para atingir metas mais rápido",
    ],
  },
};
