import { LegalPageLayout } from "../components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description="Esta página explica de forma direta quais dados o Salgadin usa hoje e para que eles servem. O texto foi escrito para um SaaS MVP que lida com dados financeiros pessoais, sem declarar conformidades que não foram formalmente assumidas."
      updatedAt="06/05/2026"
      sections={[
        {
          title: "1. Dados que podem ser coletados",
          content: (
            <>
              <p>O Salgadin pode tratar os seguintes tipos de dados:</p>
              <p>
                dados de conta, como nome, email, telefone quando informado e
                identificadores tecnicos de autenticacao;
              </p>
              <p>
                dados financeiros inseridos por você, como despesas, receitas,
                categorias, metas, notificações e preferências;
              </p>
              <p>
                dados técnicos básicos necessários para manter a sessão e operar a
                aplicação, como token salvo no navegador e configurações de tema.
              </p>
            </>
          ),
        },
        {
          title: "2. Como esses dados são usados",
          content: (
            <>
              <p>Os dados tratados pelo Salgadin são usados para:</p>
              <p>autenticar sua conta e manter sua sessão ativa;</p>
              <p>mostrar dashboard, relatórios, insights e histórico financeiro;</p>
              <p>
                permitir criação, edição e exclusão de lançamentos, categorias,
                metas e configuracoes de conta;
              </p>
              <p>
                manter segurança operacional mínima, logs técnicos e validação de
                funcionamento da API.
              </p>
            </>
          ),
        },
        {
          title: "3. Google Sign-In",
          content: (
            <>
              <p>
                Quando você usa Google Sign-In, o Salgadin recebe as informações
                necessárias para validar sua identidade e vincular sua conta ao login
                do Google.
              </p>
              <p>
                O produto não foi projetado para armazenar o token do Google além do
                necessário para o fluxo de autenticação. Depois da validação, a sessão
                principal continua sendo feita com o token do próprio Salgadin.
              </p>
            </>
          ),
        },
        {
          title: "4. localStorage, sessão e navegador",
          content: (
            <>
              <p>
                Hoje o frontend usa `localStorage` para guardar o token de
                autenticação da conta e a preferência de tema do usuário.
              </p>
              <p>
                O Salgadin não depende de uma camada pública de cookies própria para
                a experiência principal do app. Mesmo assim, serviços de terceiros
                usados no fluxo de login podem aplicar comportamentos técnicos do
                próprio navegador ou do provedor.
              </p>
            </>
          ),
        },
        {
          title: "5. Dados financeiros pessoais",
          content: (
            <>
              <p>
                O Salgadin trata os dados financeiros que você registra com foco em
                organização e visualização pessoal.
              </p>
              <p>
                Isso inclui valores, categorias, descrições, datas, metas e outros
                elementos que ajudam a mostrar seus hábitos de consumo.
              </p>
              <p>
                Como esses dados são sensiveis para o usuário, o produto evita expor
                detalhes internos em mensagens de erro e exige autenticação para
                endpoints ligados a informações da conta.
              </p>
            </>
          ),
        },
        {
          title: "6. Compartilhamento e terceiros",
          content: (
            <>
              <p>
                O Salgadin usa infraestrutura técnica de terceiros para operar, como
                hospedagem, banco de dados e autenticação com Google quando ativada.
              </p>
              <p>
                Fora disso, está política não declara venda de dados, compartilhamento
                comercial amplo ou integrações bancárias automáticas que o produto não
                oferece hoje.
              </p>
            </>
          ),
        },
        {
          title: "7. Contato e suporte",
          content: (
            <>
              <p>
                Para dúvidas sobre uso da conta, acesso ou dados inseridos no
                produto, use os canais oficiais informados pelo time do Salgadin no
                ambiente de publicação do projeto.
              </p>
              <p>
                Como o produto ainda está em fase MVP, o processo de suporte pode ser
                simples e evoluir junto com a operação.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
