import { LegalPageLayout } from "../components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacidade"
      title="Politica de Privacidade"
      description="Esta pagina explica de forma direta quais dados o Salgadin usa hoje e para que eles servem. O texto foi escrito para um SaaS MVP que lida com dados financeiros pessoais, sem declarar conformidades que nao foram formalmente assumidas."
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
                dados financeiros inseridos por voce, como despesas, receitas,
                categorias, metas, notificacoes e preferencias;
              </p>
              <p>
                dados tecnicos basicos necessarios para manter a sessao e operar a
                aplicacao, como token salvo no navegador e configuracoes de tema.
              </p>
            </>
          ),
        },
        {
          title: "2. Como esses dados sao usados",
          content: (
            <>
              <p>Os dados tratados pelo Salgadin sao usados para:</p>
              <p>autenticar sua conta e manter sua sessao ativa;</p>
              <p>mostrar dashboard, relatorios, insights e historico financeiro;</p>
              <p>
                permitir criacao, edicao e exclusao de lancamentos, categorias,
                metas e configuracoes de conta;
              </p>
              <p>
                manter seguranca operacional minima, logs tecnicos e validacao de
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
                Quando voce usa Google Sign-In, o Salgadin recebe as informacoes
                necessarias para validar sua identidade e vincular sua conta ao login
                do Google.
              </p>
              <p>
                O produto nao foi projetado para armazenar o token do Google alem do
                necessario para o fluxo de autenticacao. Depois da validacao, a sessao
                principal continua sendo feita com o token do proprio Salgadin.
              </p>
            </>
          ),
        },
        {
          title: "4. localStorage, sessao e navegador",
          content: (
            <>
              <p>
                Hoje o frontend usa `localStorage` para guardar o token de
                autenticacao da conta e a preferencia de tema do usuario.
              </p>
              <p>
                O Salgadin nao depende de uma camada publica de cookies propria para
                a experiencia principal do app. Mesmo assim, servicos de terceiros
                usados no fluxo de login podem aplicar comportamentos tecnicos do
                proprio navegador ou do provedor.
              </p>
            </>
          ),
        },
        {
          title: "5. Dados financeiros pessoais",
          content: (
            <>
              <p>
                O Salgadin trata os dados financeiros que voce registra com foco em
                organizacao e visualizacao pessoal.
              </p>
              <p>
                Isso inclui valores, categorias, descricoes, datas, metas e outros
                elementos que ajudam a mostrar seus habitos de consumo.
              </p>
              <p>
                Como esses dados sao sensiveis para o usuario, o produto evita expor
                detalhes internos em mensagens de erro e exige autenticacao para
                endpoints ligados a informacoes da conta.
              </p>
            </>
          ),
        },
        {
          title: "6. Compartilhamento e terceiros",
          content: (
            <>
              <p>
                O Salgadin usa infraestrutura tecnica de terceiros para operar, como
                hospedagem, banco de dados e autenticacao com Google quando ativada.
              </p>
              <p>
                Fora disso, esta politica nao declara venda de dados, compartilhamento
                comercial amplo ou integracoes bancarias automaticas que o produto nao
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
                Para duvidas sobre uso da conta, acesso ou dados inseridos no
                produto, use os canais oficiais informados pelo time do Salgadin no
                ambiente de publicacao do projeto.
              </p>
              <p>
                Como o produto ainda esta em fase MVP, o processo de suporte pode ser
                simples e evoluir junto com a operacao.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
