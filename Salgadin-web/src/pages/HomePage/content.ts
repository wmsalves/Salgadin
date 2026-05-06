import {
  BarChart3,
  BellRing,
  LayoutDashboard,
  MessageCircleMore,
  ReceiptText,
  ShieldCheck,
  Tags,
} from "lucide-react";

export const features = [
  {
    title: "Entenda para onde o dinheiro vai",
    desc: "Transforme cafe, lanche, delivery, mercado e transporte em uma leitura clara do que realmente pesa no mes.",
    icon: LayoutDashboard,
    colorTheme: "emerald",
  },
  {
    title: "Corrija pequenos excessos cedo",
    desc: "Veja os sinais antes que despesas recorrentes virem um problema no fim do mes.",
    icon: BellRing,
    colorTheme: "amber",
  },
  {
    title: "Troque planilha por rotina simples",
    desc: "Registre, categorize e acompanhe com um fluxo leve, pensado para uso real no dia a dia.",
    icon: ReceiptText,
    colorTheme: "emerald",
  },
];

export const differentiators = [
  {
    title: "Registro rapido",
    desc: "Adicione um gasto em segundos e mantenha o controle sem quebrar sua rotina.",
    icon: ReceiptText,
  },
  {
    title: "Categorias organizadas",
    desc: "Agrupe despesas por contexto para enxergar habitos, repeticoes e excessos com facilidade.",
    icon: Tags,
  },
  {
    title: "Graficos com contexto",
    desc: "Nao e so barra bonita. O painel ajuda a entender o que aconteceu em cada dia e categoria.",
    icon: BarChart3,
  },
  {
    title: "Resumo diario e mensal",
    desc: "Veja o que entrou, o que saiu e o que pede atencao sem abrir uma planilha.",
    icon: LayoutDashboard,
  },
  {
    title: "WhatsApp em preparacao",
    desc: "A fundacao da integracao esta em desenvolvimento, mas ainda nao e uma feature publica ativa.",
    icon: MessageCircleMore,
  },
];

export const trustItems = [
  {
    title: "Privacidade direta",
    desc: "Seus dados financeiros ficam ligados a sua conta e nao dependem de acesso bancario automatico.",
    icon: ShieldCheck,
  },
  {
    title: "Controle do que voce registra",
    desc: "O produto e focado em lancamentos manuais e claros, para voce entender seus habitos com precisao.",
    icon: ReceiptText,
  },
  {
    title: "Evolucao responsavel do MVP",
    desc: "Novas camadas, como WhatsApp e recursos Pro, estao sendo preparadas sem promessas artificiais no produto.",
    icon: MessageCircleMore,
  },
];

export const faqItems = [
  {
    q: "Como o Salgadin protege meus dados financeiros?",
    a: "O Salgadin organiza suas informacoes com cuidado e segue boas praticas de privacidade. A proposta e dar clareza sobre seus proprios lancamentos, sem vender a ideia de acesso bancario automatico ou integracoes que o produto ainda nao oferece.",
  },
  {
    q: "Preciso ter conhecimentos financeiros para usar?",
    a: "Nao. A experiencia foi pensada para quem quer entender o basico com clareza: registrar uma despesa, escolher uma categoria e ver o padrao aparecer nos graficos.",
  },
  {
    q: "O Salgadin funciona no celular e no computador?",
    a: "Sim. O produto e web e responsivo, pensado para funcionar bem no navegador do celular, tablet e desktop.",
  },
  {
    q: "O WhatsApp ja esta disponivel?",
    a: "Ainda nao como integracao publica. A base dessa experiencia esta sendo preparada, mas hoje o fluxo principal continua sendo o registro direto no app.",
  },
  {
    q: "Existe plano pago?",
    a: "Hoje existe uma experiencia gratuita para quem quer comecar a organizar os gastos diarios. O plano Pro esta em preparacao para adicionar filtros, historico mais completo e camadas extras de acompanhamento.",
  },
];

export const tabsContent = {
  Dashboard: {
    title: "Visualize tudo em um so lugar",
    description:
      "O painel principal reune lancamentos, categorias e metas em uma visao simples. A ideia e mostrar o que mudou no mes sem transformar sua rotina em planilha.",
    items: [
      "Resumo financeiro organizado para decisoes mais seguras",
      "Graficos interativos com leitura rapida e foco no essencial",
      "Alertas personalizados quando um gasto foge do planejado",
    ],
  },
  Despesas: {
    title: "Registre despesas sem complicacao",
    description:
      "O fluxo atual e manual: voce adiciona o gasto, escolhe uma categoria e acompanha o impacto no mes. E direto para cafes, lanches, delivery, mercado, transporte e compras recorrentes.",
    items: [
      "Categorias rapidas, filtros simples e visao por periodo",
      "Exportacao em CSV para compartilhar quando precisar",
      "Detalhamento por item para cortes mais inteligentes",
    ],
  },
  Metas: {
    title: "Alcance objetivos com mais clareza",
    description:
      "Defina metas que fazem sentido para voce e acompanhe o progresso com leitura visual simples, sem perder o contexto do mes.",
    items: [
      "Metas gerais ou por categoria com acompanhamento visual",
      "Alertas antes de estourar o limite planejado",
      "Progresso claro para manter ritmo e consistencia",
    ],
  },
};
