import {
  Download,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

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

