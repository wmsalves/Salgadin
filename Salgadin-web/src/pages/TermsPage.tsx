import { LegalPageLayout } from "../components/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Termos"
      title="Termos de Uso"
      description="Estes termos descrevem de forma simples como o Salgadin pode ser usado hoje. O objetivo e dar clareza sobre o produto, sem prometer protecoes ou obrigacoes que nao fazem parte do escopo atual do MVP."
      updatedAt="06/05/2026"
      sections={[
        {
          title: "1. Sobre o Salgadin",
          content: (
            <>
              <p>
                O Salgadin e uma aplicacao web de financas pessoais focada em pequenos
                gastos do dia a dia, como cafe, lanche, delivery, mercado e transporte.
              </p>
              <p>
                O produto existe para ajudar voce a registrar, visualizar e entender
                melhor esses lancamentos. Ele nao substitui consultoria financeira,
                contabilidade ou servicos bancarios.
              </p>
            </>
          ),
        },
        {
          title: "2. Cadastro e autenticacao",
          content: (
            <>
              <p>
                Para usar areas autenticadas do produto, voce precisa criar uma conta
                com email e senha ou usar Google Sign-In quando essa opcao estiver
                disponivel.
              </p>
              <p>
                Voce e responsavel por manter seus dados de acesso em seguranca e por
                revisar as informacoes usadas na sua conta.
              </p>
            </>
          ),
        },
        {
          title: "3. Dados inseridos por voce",
          content: (
            <>
              <p>
                O Salgadin permite que voce registre dados financeiros pessoais, como
                despesas, receitas, categorias, metas e observacoes relacionadas aos
                seus lancamentos.
              </p>
              <p>
                Esses dados sao usados para exibir dashboard, graficos, resumos e
                funcionalidades internas do proprio produto.
              </p>
            </>
          ),
        },
        {
          title: "4. Uso adequado do produto",
          content: (
            <>
              <p>
                O Salgadin deve ser usado para organizacao financeira pessoal e para
                acompanhamento dos seus proprios dados.
              </p>
              <p>
                Nao e permitido tentar acessar contas de outras pessoas, explorar
                falhas de seguranca, automatizar abuso da aplicacao ou usar o servico
                para fins ilicitos.
              </p>
            </>
          ),
        },
        {
          title: "5. Disponibilidade e evolucao do MVP",
          content: (
            <>
              <p>
                O Salgadin esta em evolucao. Recursos podem ser ajustados, ampliados
                ou removidos para melhorar estabilidade, seguranca e clareza do
                produto.
              </p>
              <p>
                Funcionalidades em desenvolvimento, como integracao futura com
                WhatsApp ou plano Pro, nao devem ser interpretadas como disponiveis
                para uso publico ate que isso seja informado claramente dentro do app.
              </p>
            </>
          ),
        },
        {
          title: "6. Limitacao de responsabilidade",
          content: (
            <>
              <p>
                O Salgadin organiza informacoes que voce registra, mas nao garante
                eliminacao de perdas financeiras, resultados especificos ou decisoes
                perfeitas.
              </p>
              <p>
                Sempre confirme seus dados antes de tomar decisoes relevantes com base
                nas informacoes exibidas.
              </p>
            </>
          ),
        },
        {
          title: "7. Contato e suporte",
          content: (
            <>
              <p>
                Se voce precisar de ajuda sobre acesso, uso da conta ou comportamento
                do produto, utilize os canais oficiais informados pelo time do
                Salgadin no ambiente de publicacao do projeto.
              </p>
              <p>
                Como o produto ainda esta em fase MVP, o suporte pode ser limitado e
                evoluir junto com a operacao do servico.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
