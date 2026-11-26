import {
  BarChart3,
  BellRing,
  Download,
  LayoutDashboard,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Tags,
} from "lucide-react";

export const features = [
  {
    title: "Entenda para onde o dinheiro vai",
    desc: "Transforme café, lanche, delivery, mercado e transporte em uma leitura clara do que realmente pesa no mês.",
    icon: LayoutDashboard,
    colorTheme: "emerald",
  },
  {
    title: "Corrija pequenos excessos cedo",
    desc: "Veja os sinais antes que despesas recorrentes virem um problema no fim do mês.",
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
    title: "Registro rápido",
    desc: "Adicione um gasto em segundos e mantenha o controle sem quebrar sua rotina.",
    icon: ReceiptText,
  },
  {
    title: "Categorias organizadas",
    desc: "Agrupe despesas por contexto para enxergar hábitos, repetições e excessos com facilidade.",
    icon: Tags,
  },
  {
    title: "Gráficos com contexto",
    desc: "Cada gráfico mostra o que aconteceu em cada dia e em cada categoria, com os valores à vista.",
    icon: BarChart3,
  },
  {
    title: "Resumo diário e mensal",
    desc: "Veja o que entrou, o que saiu e o que pede atenção sem abrir uma planilha.",
    icon: LayoutDashboard,
  },
  {
    title: "Metas que avisam antes",
    desc: "Defina um limite por categoria e receba um aviso quando o gasto chegar perto dele.",
    icon: BellRing,
  },
];

export const trustItems = [
  {
    title: "Seus dados são só seus",
    desc: "Cada lançamento fica ligado à sua conta. Ninguém além de você vê o que você registra.",
    icon: ShieldCheck,
  },
  {
    title: "Sem acesso ao seu banco",
    desc: "O Salgadin não pede senha de banco nem conecta contas. Você decide o que entra.",
    icon: LockKeyhole,
  },
  {
    title: "Exporte quando quiser",
    desc: "Baixe suas receitas e despesas em CSV a qualquer momento e leve seus dados para onde precisar.",
    icon: Download,
  },
];

export const faqItems = [
  {
    q: "Como o Salgadin protege meus dados financeiros?",
    a: "Sua senha é guardada com hash, o acesso é feito por login próprio ou Google, e cada conta só enxerga os próprios lançamentos. O Salgadin também não se conecta ao seu banco: só existe o que você registra.",
  },
  {
    q: "Preciso ter conhecimentos financeiros para usar?",
    a: "Não. A experiência foi pensada para quem quer entender o básico com clareza: registrar uma despesa, escolher uma categoria e ver o padrão aparecer nos gráficos.",
  },
  {
    q: "O Salgadin funciona no celular e no computador?",
    a: "Sim. O Salgadin funciona no navegador do celular, do tablet e do computador, com a mesma conta.",
  },
  {
    q: "Existe plano pago?",
    a: "Hoje o Salgadin é gratuito. Um plano Pro, com histórico e filtros mais completos, está em desenvolvimento.",
  },
];

export const tabsContent = {
  Dashboard: {
    title: "Visualize tudo em um só lugar",
    description:
      "O painel reúne lançamentos, categorias e metas em uma visão simples e mostra o que mudou no mês, sem transformar sua rotina em planilha.",
    items: [
      "Resumo financeiro organizado para decisões mais seguras",
      "Gráficos interativos com leitura rápida e foco no essencial",
      "Alertas personalizados quando um gasto foge do planejado",
    ],
  },
  Despesas: {
    title: "Registre despesas sem complicação",
    description:
      "Você adiciona o gasto, escolhe uma categoria e já vê o impacto no mês. Funciona bem para cafés, lanches, delivery, mercado, transporte e contas que se repetem.",
    items: [
      "Categorias rápidas, filtros simples e visão por período",
      "Exportação em CSV para compartilhar quando precisar",
      "Detalhamento por item para cortes mais inteligentes",
    ],
  },
  Metas: {
    title: "Alcance objetivos com mais clareza",
    description:
      "Defina metas que fazem sentido para você e acompanhe o progresso com leitura visual simples, sem perder o contexto do mês.",
    items: [
      "Metas gerais ou por categoria com acompanhamento visual",
      "Alertas antes de estourar o limite planejado",
      "Progresso claro para manter ritmo e consistência",
    ],
  },
};
