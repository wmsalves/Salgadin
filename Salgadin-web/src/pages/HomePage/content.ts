import { Wallet, SlidersHorizontal, BarChart3, Target } from "lucide-react";

export const features = [
  {
    title: "Controle de Despesas",
    desc: "Acompanhe todos os seus gastos em um só lugar, com categorização automática e análise detalhada.",
    icon: Wallet, // O componente Wallet
    colorTheme: "emerald",
  },
  {
    title: "Orçamento Inteligente",
    desc: "Crie orçamentos personalizados e receba alertas quando estiver próximo de atingir seus limites.",
    icon: SlidersHorizontal, // O componente SlidersHorizontal
    colorTheme: "amber",
  },
  {
    title: "Relatórios Detalhados",
    desc: "Visualize sua saúde financeira com gráficos e relatórios personalizados e fáceis de entender.",
    icon: BarChart3, // O componente BarChart3
    colorTheme: "emerald",
  },
  {
    title: "Metas Financeiras",
    desc: "Estabeleça metas de economia e acompanhe seu progresso com visualizações claras e motivadoras.",
    icon: Target, // O componente Target
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
