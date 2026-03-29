import { Wallet, SlidersHorizontal, BarChart3, Target } from "lucide-react";

export const features = [
  {
    title: "Controle de Despesas",
    desc: "Acompanhe todos os seus gastos em um só lugar, com categorização automática e análise detalhada.",
    icon: Wallet,
    colorTheme: "emerald",
  },
  {
    title: "Orçamento Inteligente",
    desc: "Crie orçamentos personalizados e receba alertas quando estiver próximo de atingir seus limites.",
    icon: SlidersHorizontal,
    colorTheme: "amber",
  },
  {
    title: "Relatórios Detalhados",
    desc: "Visualize sua saúde financeira com gráficos e relatórios personalizados e fáceis de entender.",
    icon: BarChart3,
    colorTheme: "emerald",
  },
  {
    title: "Metas Financeiras",
    desc: "Estabeleça metas de economia e acompanhe seu progresso com visualizações claras e motivadoras.",
    icon: Target,
    colorTheme: "amber",
  },
];

export const faqItems = [
  {
    q: "Como o Salgadin protege meus dados financeiros?",
    a: "A sua segurança é nossa prioridade máxima. Utilizamos criptografia de nível bancário para proteger todos os seus dados, tanto em trânsito quanto em repouso. Seguimos os mais rigorosos padrões de segurança e privacidade, alinhados com a Lei Geral de Proteção de Dados (LGPD). Suas informações são suas, e nunca as compartilharemos com terceiros sem a sua permissão explícita.",
  },
  {
    q: "Preciso ter conhecimentos financeiros para usar?",
    a: "De forma alguma! O Salgadin foi desenhado exatamente para quem busca simplicidade. Se você sabe o que é uma despesa, já sabe usar 90% da plataforma. Recursos como a categorização automática e os relatórios visuais fazem o trabalho pesado por você, transformando dados complexos em informações claras e acionáveis para o seu dia a dia.",
  },
  {
    q: "Funciona em todos os meus dispositivos?",
    a: "Sim! O Salgadin é uma plataforma web totalmente responsiva, funcionando perfeitamente no seu computador, tablet ou celular. Seus dados são sincronizados em tempo real em todos os dispositivos, garantindo que você tenha acesso às suas finanças onde quer que esteja. Nossos aplicativos nativos para iOS e Android estão em desenvolvimento para oferecer uma experiência ainda mais integrada em breve.",
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
      "O dashboard principal do Salgadin oferece uma visão completa da sua saúde financeira. Acompanhe receitas, despesas, metas e economias em um único painel, com insights claros e decisões mais rápidas no dia a dia.",
    items: [
      "Resumo financeiro atualizado em tempo real para decisões mais seguras",
      "Gráficos interativos com leitura rápida e foco no essencial",
      "Alertas personalizados quando um gasto foge do planejado",
    ],
  },
  Despesas: {
    title: "Controle total das suas despesas",
    description:
      "Registre gastos em poucos cliques e entenda para onde o dinheiro está indo. Organize o mês com clareza, sem esforço e com visão do que pode ser ajustado.",
    items: [
      "Categorias rápidas, filtros simples e visão por período",
      "Exportação em CSV ou PDF para compartilhar quando precisar",
      "Detalhamento por item para cortes mais inteligentes",
    ],
  },
  Metas: {
    title: "Alcance seus objetivos financeiros",
    description:
      "Defina metas que fazem sentido para você e acompanhe o progresso em tempo real. Visualize o avanço mês a mês e saiba exatamente o que falta para chegar lá.",
    items: [
      "Metas gerais ou por categoria com acompanhamento visual",
      "Alertas antes de estourar o limite e ajustes sugeridos",
      "Progresso claro para manter o ritmo e motivação",
    ],
  },
};
