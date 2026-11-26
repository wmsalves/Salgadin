import { LegalPageLayout } from "../components/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Termos"
      title="Termos de Uso"
      description="Estes termos descrevem de forma simples como o Salgadin pode ser usado hoje. O objetivo é dar clareza sobre o produto, sem prometer proteções ou obrigações que não fazem parte do escopo atual do MVP."
      updatedAt="06/05/2026"
      sections={[
        {
          title: "1. Sobre o Salgadin",
          content: (
            <>
              <p>
                O Salgadin é uma aplicação web de finanças pessoais focada em pequenos
                gastos do dia a dia, como café, lanche, delivery, mercado e transporte.
              </p>
              <p>
                O produto existe para ajudar você a registrar, visualizar e entender
                melhor esses lançamentos. Ele não substitui consultoria financeira,
                contabilidade ou serviços bancários.
              </p>
            </>
          ),
        },
        {
          title: "2. Cadastro e autenticação",
          content: (
            <>
              <p>
                Para usar áreas autenticadas do produto, você precisa criar uma conta
                com email e senha ou usar Google Sign-In quando essa opção estiver
                disponível.
              </p>
              <p>
                Você é responsável por manter seus dados de acesso em segurança e por
                revisar as informações usadas na sua conta.
              </p>
            </>
          ),
        },
        {
          title: "3. Dados inseridos por você",
          content: (
            <>
              <p>
                O Salgadin permite que você registre dados financeiros pessoais, como
                despesas, receitas, categorias, metas e observações relacionadas aos
                seus lançamentos.
              </p>
              <p>
                Esses dados são usados para exibir dashboard, gráficos, resumos e
                funcionalidades internas do próprio produto.
              </p>
            </>
          ),
        },
        {
          title: "4. Uso adequado do produto",
          content: (
            <>
              <p>
                O Salgadin deve ser usado para organização financeira pessoal e para
                acompanhamento dos seus próprios dados.
              </p>
              <p>
                Não e permitido tentar acessar contas de outras pessoas, explorar
                falhas de segurança, automatizar abuso da aplicação ou usar o serviço
                para fins ilícitos.
              </p>
            </>
          ),
        },
        {
          title: "5. Disponibilidade e evolução do MVP",
          content: (
            <>
              <p>
                O Salgadin está em evolução. Recursos podem ser ajustados, ampliados
                ou removidos para melhorar estabilidade, segurança e clareza do
                produto.
              </p>
              <p>
                Funcionalidades em desenvolvimento, como integração futura com
                WhatsApp ou plano Pro, não devem ser interpretadas como disponíveis
                para uso publico até que isso seja informado claramente dentro do app.
              </p>
            </>
          ),
        },
        {
          title: "6. Limitação de responsabilidade",
          content: (
            <>
              <p>
                O Salgadin organiza informações que você registra, mas não garante
                eliminação de perdas financeiras, resultados específicos ou decisões
                perfeitas.
              </p>
              <p>
                Sempre confirme seus dados antes de tomar decisões relevantes com base
                nas informações exibidas.
              </p>
            </>
          ),
        },
        {
          title: "7. Contato e suporte",
          content: (
            <>
              <p>
                Se você precisar de ajuda sobre acesso, uso da conta ou comportamento
                do produto, utilize os canais oficiais informados pelo time do
                Salgadin no ambiente de publicação do projeto.
              </p>
              <p>
                Como o produto ainda está em fase MVP, o suporte pode ser limitado e
                evoluir junto com a operação do serviço.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
