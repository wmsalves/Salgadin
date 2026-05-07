# Salgadin — Product Context

## 1. Visão geral

O Salgadin é um SaaS MVP de finanças pessoais focado em pequenos gastos do dia a dia.

O nome vem de "salgadinho", como coxinha, pastel, café, lanche e outros consumos recorrentes que parecem pequenos isoladamente, mas se acumulam ao longo do mês. A proposta do produto é ajudar o usuário a registrar esses lançamentos com rapidez, visualizar padrões de consumo e tomar decisões melhores antes que os gastos cresçam.

Hoje o produto já combina:

- landing page pública
- autenticação tradicional e com Google
- dashboard com resumos, gráficos e insights heurísticos
- gestão de despesas, rendas, categorias e metas
- alertas/notificações
- relatórios e exportação
- área de perfil/configurações
- fundação interna para futura integração com WhatsApp

## 2. Problema que o produto resolve

O Salgadin resolve um problema comum de finanças pessoais: pequenos gastos recorrentes são fáceis de ignorar, mas difíceis de perceber em conjunto.

Exemplos típicos:

- café diário
- almoço por aplicativo
- transporte pontual
- ida ao mercado
- pequenos lanches ou compras de conveniência

Esses valores costumam escapar do controle porque:

- o registro é inconsistente
- o usuário não quer lidar com planilhas complexas
- o acompanhamento visual não é claro
- o impacto acumulado só aparece tarde demais

O Salgadin tenta reduzir esse atrito com registro simples, categorias, gráficos e alertas leves.

## 3. Público-alvo

Perfis principais:

- pessoas que querem controlar gastos diários sem usar planilhas complexas
- usuários que precisam visualizar hábitos de consumo com clareza
- pessoas que já tentaram se organizar financeiramente, mas abandonaram ferramentas pesadas
- usuários que valorizam simplicidade, visual limpo e feedback rápido

O produto não parece um app bancário tradicional. A linguagem é mais leve e próxima da rotina real do usuário brasileiro.

## 4. Proposta de valor

Proposta central do produto:

- registrar pequenos gastos com rapidez
- entender para onde o dinheiro está indo
- acompanhar renda, despesas e saldo do período
- visualizar categorias e tendências
- definir metas simples de gasto
- receber alertas antes de estourar limites
- exportar dados quando necessário
- preparar um futuro fluxo de registro por mensagem

## 5. Tom e personalidade

Tom desejado do produto:

- amigável
- confiável
- simples
- brasileiro
- financeiro, mas não bancário demais
- leve, mas não infantil

Direção prática:

- o produto evita linguagem alarmista
- mensagens de erro devem ser claras, mas não técnicas
- empty states devem orientar a próxima ação
- números, moeda e datas precisam transmitir confiança

## 6. Stack técnica

| Camada                 | Stack atual                                      |
| ---------------------- | ------------------------------------------------ |
| Frontend               | React, TypeScript, Vite, Tailwind CSS            |
| Forms/validação        | React Hook Form, Zod                             |
| Visualização           | Recharts                                         |
| HTTP client            | Axios                                            |
| Auth social            | `@react-oauth/google`                            |
| Backend                | ASP.NET Core / .NET 9                            |
| ORM                    | Entity Framework Core                            |
| Banco                  | Supabase Postgres com Npgsql                     |
| Auth                   | JWT próprio + Google Sign-In validado no backend |
| Logs                   | Serilog                                          |
| API docs               | Swagger/OpenAPI em Development                   |
| Deploy frontend        | Vercel                                           |
| Deploy backend         | Render                                           |
| Observabilidade básica | `/health`, `/health/live`, `/health/ready`       |

## 7. Funcionalidades implementadas

### Visão por módulo

| Módulo                         | Status             | Resumo                                                                                             |
| ------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------- |
| Landing page                   | Implementado       | Página pública com hero, proposta de valor, pricing simples, FAQ, confiança e links legais.        |
| Autenticação                   | Implementado       | Cadastro, login por email/senha, JWT próprio, rota de perfil autenticado.                          |
| Google Sign-In                 | Implementado       | Login com Google preservando emissão do JWT do Salgadin.                                           |
| Dashboard                      | Implementado       | KPIs, gráfico mensal, últimas receitas/despesas, alertas de metas e insights heurísticos.          |
| Despesas                       | Implementado       | CRUD via backend, filtros por período/categoria, resumo diário, exportação.                        |
| Renda                          | Implementado       | Cadastro e listagem; edição/remoção no frontend já foram trabalhadas no fluxo da dashboard.        |
| Categorias                     | Implementado       | CRUD básico de categorias e subcategorias, resumo visual por categoria.                            |
| Metas                          | Implementado       | Criação de metas, leitura de progresso, alertas do mês e resumo de saúde das metas.                |
| Alertas/Notificações           | Implementado       | Preferências, listagem, marcação como lido e alertas vinculados às metas.                          |
| Relatórios                     | Implementado       | Relatórios mensal/semanal, comparação mensal, resumo e exportação CSV/PDF.                         |
| Profile/Settings               | Implementado       | Perfil, segurança, preferências, exportação, WhatsApp beta e notificações.                         |
| Exportação CSV                 | Parcial            | Exportação real de despesas em CSV; exportação de rendas ainda aparece como “em breve”.            |
| Legal pages                    | Implementado       | `/terms` e `/privacy`.                                                                             |
| Open Graph/branding            | Implementado       | OG image em PNG com fonte SVG editável; favicon e logo otimizados.                                 |
| Health checks                  | Implementado       | `/health`, `/health/live`, `/health/ready` e endpoint interno opcional.                            |
| WhatsApp foundation/simulation | Em desenvolvimento | Fundação de backend pronta e simulador dev/beta; integração real com Meta/Twilio ainda não existe. |

### 7.1 Landing page

**O que existe**

- página pública em `/`
- hero com proposta de valor
- seções “como funciona”, benefícios, diferenciais, pricing e FAQ
- bloco de confiança/privacidade
- links para termos e privacidade

**Arquivos relevantes**

- `Salgadin-web/src/pages/HomePage/*`
- `Salgadin-web/src/components/Header.tsx`
- `Salgadin-web/src/components/Footer.tsx`

**Limitações conhecidas**

- pricing é informativo; não existe billing real
- “Pro” aparece como futuro, não como plano ativo

**Status**

- Implementado

### 7.2 Autenticação

**O que existe**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- proteção de rotas no frontend com `ProtectedRoute`

**Funcionalidades**

- login tradicional com email/senha
- perfil autenticado
- atualização de nome, email, telefone e senha via área de conta

**Limitações conhecidas**

- não há fluxo explícito de recuperação de senha visível nesta leitura

**Status**

- Implementado

### 7.3 Google Sign-In

**O que existe**

- frontend usa `@react-oauth/google`
- backend expõe `POST /api/auth/google`
- validação do token Google acontece no backend
- backend emite JWT próprio do Salgadin

**Limitações conhecidas**

- depende de `VITE_GOOGLE_CLIENT_ID` no frontend e `Authentication__Google__ClientId` no backend

**Status**

- Implementado

### 7.4 Dashboard

**O que existe**

- KPIs principais
- fluxo de caixa mensal
- últimas receitas
- últimas despesas
- alertas de metas
- insights financeiros simples, sem IA externa
- onboarding/empty states para primeiro uso

**Arquivos relevantes**

- `Salgadin-web/src/pages/DashboardPage.tsx`

**Exemplos de insights atuais**

- maior categoria do período
- comparação simples com semana anterior dentro dos dados carregados
- maior lançamento recente/do período

**Limitações conhecidas**

- os insights são heurísticos, não analíticos avançados
- a comparação depende dos dados já carregados no dashboard

**Status**

- Implementado

### 7.5 Despesas

**O que existe**

- backend com CRUD autenticado:
  - `GET /api/expense`
  - `GET /api/expense/{id}`
  - `POST /api/expense`
  - `PUT /api/expense/{id}`
  - `DELETE /api/expense/{id}`
  - `GET /api/expense/summary`
  - `GET /api/expense/export`
- filtros por data e categoria
- exportação em CSV e PDF a partir dos relatórios/export service

**Limitações conhecidas**

- a UI dedicada de despesas como página separada não aparece nesta rota atual; boa parte do fluxo está concentrada em dashboard/relatórios/categorias
- vale confirmar se existe página específica de despesas em branch futura ou apenas fluxo via dashboard

**Status**

- Implementado no backend e no fluxo do produto
- Página dedicada de despesas: a confirmar

### 7.6 Renda

**O que existe**

- backend com endpoints de renda
- listagem e uso na dashboard
- suporte a renda fixa e renda extra

**Limitações conhecidas**

- exportação própria de renda ainda não está pronta na área de settings

**Status**

- Implementado
- Exportação separada de renda: em desenvolvimento/futuro

### 7.7 Categorias

**O que existe**

- criação de categoria
- edição e exclusão
- subcategorias por categoria
- resumo visual por categoria
- empty states

**Arquivos relevantes**

- `Salgadin-web/src/pages/CategoriesPage.tsx`
- `Salgadin-web/src/services/categoryService.ts`
- `Salgadin-web/src/services/subcategoryService.ts`

**Limitações conhecidas**

- categoria depende do uso real do usuário para ganhar contexto visual

**Status**

- Implementado

### 7.8 Metas

**O que existe**

- criação, atualização e remoção no backend
- alertas por mês
- cards de progresso
- resumo de metas ativas, saudáveis e que pedem atenção
- empty states refinados

**Arquivos relevantes**

- `Salgadin-web/src/pages/GoalsPage.tsx`
- `Salgadin-web/src/services/goalService.ts`
- `Salgadin/Controllers/GoalsController.cs`

**Limitações conhecidas**

- a UI atual prioriza criação e acompanhamento; edição/remoção direta na tela principal pode precisar de refinamento adicional
- o campo de limiar de alerta ainda é técnico (`0-1`) para o usuário final

**Status**

- Implementado

### 7.9 Alertas e notificações

**O que existe**

- preferências:
  - email
  - push
  - threshold mínimo
- alertas por metas
- notificações persistidas
- filtros e marcação como lido

**Endpoints**

- `GET /api/notifications/preferences`
- `PUT /api/notifications/preferences`
- `GET /api/notifications/alerts`
- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all`

**Status**

- Implementado

### 7.10 Relatórios

**O que existe**

- relatório mensal
- relatório semanal
- comparação entre meses
- resumo analítico do período
- insights automáticos no módulo de relatórios
- exportação CSV/PDF
- filtros por categoria, subcategoria e faixa de valor

**Arquivos relevantes**

- `Salgadin-web/src/pages/ReportsPage.tsx`
- `Salgadin/Controllers/ReportsController.cs`

**Limitações conhecidas**

- foco atual é leitura operacional; ainda não há camadas avançadas de analytics

**Status**

- Implementado

### 7.11 Profile / Settings

**O que existe**

- dados de perfil
- alteração de nome, email, telefone e senha
- validação básica de campos
- preferências do app
- alertas e notificações
- exportação de despesas
- seção de WhatsApp em desenvolvimento

**Arquivos relevantes**

- `Salgadin-web/src/pages/ProfilePage.tsx`

**Status**

- Implementado

### 7.12 Exportação CSV

**O que existe**

- exportação de despesas em CSV real
- fluxo de exportação acionado pelo frontend

**Limitações conhecidas**

- exportação de rendas aparece como “em breve”

**Status**

- Parcial

### 7.13 Legal pages

**O que existe**

- `/terms`
- `/termos`
- `/privacy`
- `/privacidade`

**Status**

- Implementado

### 7.14 Open Graph e branding

**O que existe**

- `Salgadin-web/public/og-image.png`
- fonte editável em `Salgadin-web/public/og-image.svg`
- preview em `Salgadin-web/public/og-preview.html`
- geração por Node/sharp via `npm run generate:og`
- logo e favicon otimizados

**Status**

- Implementado

### 7.15 Health checks e readiness

**O que existe**

- `GET /health`
- `GET /health/live`
- `GET /health/ready`
- `GET /internal/health/database` quando `INTERNAL_HEALTH_TOKEN` está configurado

**Limitação importante**

- `/health/ready` verifica conectividade com o banco, não schema/migrations pendentes

**Status**

- Implementado

### 7.16 WhatsApp foundation / simulation

**O que existe**

- entidades e migration para vínculo de WhatsApp
- geração de código de conexão
- status da conexão
- desconexão
- parser interno de mensagens
- simulação de mensagem recebida
- idempotência por `messageId`
- painel frontend dev-only / beta

**Endpoints**

- `POST /api/whatsapp/link-code`
- `GET /api/whatsapp/status`
- `DELETE /api/whatsapp/disconnect`
- `POST /api/dev/whatsapp/simulate`

**Limitações conhecidas**

- não envia mensagens reais
- não integra Meta WhatsApp Cloud API
- não integra Twilio
- acesso ao simulador fora de Development é protegido por env + allowlist

**Status**

- Em desenvolvimento / simulação

## 8. Fluxos principais do usuário

### 8.1 Cadastro e login tradicional

1. Usuário acessa landing.
2. Vai para `/signup` ou `/login`.
3. Backend retorna JWT próprio.
4. Frontend salva o token no fluxo de autenticação atual.
5. Usuário entra na área protegida.

### 8.2 Login com Google

1. Usuário clica em login com Google.
2. Frontend recebe `credential/id_token`.
3. Envia para `POST /api/auth/google`.
4. Backend valida o token do Google.
5. Backend localiza ou vincula usuário.
6. Backend emite o JWT próprio do Salgadin.
7. Usuário segue para o dashboard.

### 8.3 Primeiro acesso / onboarding

1. Usuário autenticado chega ao dashboard.
2. Se não houver dados suficientes, o produto mostra empty states orientados.
3. O fluxo sugere:
   - registrar renda
   - registrar gasto
   - criar categoria
   - criar meta

### 8.4 Adicionar despesa

1. Usuário registra gasto pelo fluxo disponível no app.
2. Despesa é associada ao usuário autenticado.
3. O dashboard, categorias, relatórios e insights passam a refletir esse dado.

### 8.5 Visualizar dashboard

1. Dashboard carrega despesas, rendas, metas e alertas do mês.
2. Mostra KPIs, fluxo de caixa, últimas movimentações e insights.
3. Se não houver dados, mostra empty states úteis em vez de tela vazia.

### 8.6 Criar meta

1. Usuário acessa `/metas`.
2. Define limite mensal geral ou por categoria.
3. Ajusta limiar de alerta.
4. O sistema passa a gerar leitura de progresso e alertas do mês.

### 8.7 Exportar dados

1. Usuário acessa Settings/Profile ou relatórios.
2. Exporta despesas em CSV.
3. No módulo de relatórios, também pode acionar exportação CSV/PDF do período filtrado.

### 8.8 Acessar configurações

1. Usuário vai para `/perfil`.
2. Pode:
   - editar perfil
   - alterar senha/email
   - ajustar preferências
   - revisar notificações
   - exportar despesas
   - ver status do WhatsApp beta

### 8.9 Gerar código de WhatsApp

1. Usuário salva telefone no perfil.
2. Acessa a seção WhatsApp em Settings.
3. Gera um código temporário de conexão.
4. O código hoje serve para a fundação/beta, não para conexão real com provedores externos.

### 8.10 Simular mensagem WhatsApp em dev/beta

1. Em Development, ou com env explícita no frontend, o painel do simulador aparece.
2. Usuário autorizado pode enviar uma mensagem simulada.
3. Backend interpreta a mensagem.
4. Se o telefone estiver vinculado e a mensagem for válida, cria uma despesa.
5. Retorna uma resposta textual simulada.

## 9. Integrações

| Integração          | Estado atual       | Observações                                        |
| ------------------- | ------------------ | -------------------------------------------------- |
| Google Sign-In      | Implementado       | Validação no backend e JWT próprio do Salgadin.    |
| Supabase Postgres   | Implementado       | Fonte principal de dados em produção.              |
| Render              | Implementado       | Backend e health checks pensados para esse deploy. |
| Vercel              | Implementado       | Frontend SPA.                                      |
| WhatsApp foundation | Em desenvolvimento | Parser, vínculo, código e simulador prontos.       |
| Meta/Twilio         | Não implementado   | Planejado para etapa futura.                       |

## 10. Segurança e privacidade

Decisões já existentes no código:

- autenticação com JWT próprio
- login com Google validado no backend
- dados sempre associados ao usuário autenticado
- controllers protegidos para módulos sensíveis
- health checks sem exposição de secrets
- endpoint interno de saúde do banco protegido por token
- simulador WhatsApp protegido por ambiente e allowlist fora de Development
- páginas públicas de termos e privacidade existentes

Pontos importantes:

- não há indicação de multi-tenant além da separação por usuário autenticado
- o simulador WhatsApp não é uma integração pública
- o produto lida com dados financeiros pessoais, então erros e logs devem continuar mínimos e seguros

## 11. Estados de produto e UX

O produto já usa, de forma relevante:

- onboarding básico
- empty states
- loading states
- error states
- success messages

Padrões observados:

- `EmptyState` compartilhado no frontend
- mensagens orientadas à próxima ação
- evitar tela vazia em dashboard, metas, categorias, relatórios e settings

Mascote:

- o nome `Coxito` aparece como direção no `AGENTS.md`
- uso real do mascote no produto atual: a confirmar

## 12. Branding

Elementos de branding identificados:

- nome `Salgadin`
- identidade visual quente, premium e moderna
- Open Graph image pronta para produção
- logo e favicon próprios
- landing page com linguagem de SaaS MVP

Direção visual percebida no código:

- superfícies suaves
- tons quentes/âmbar
- visual financeiro, mas leve
- cards, dashboards e gráficos com linguagem de produto

Mascote:

- `Coxito` está documentado como direção possível
- adoção efetiva ainda parece limitada ou futura

## 13. Funcionalidades em desenvolvimento ou beta

| Item                                         | Estado                                  |
| -------------------------------------------- | --------------------------------------- |
| Integração real com WhatsApp via Meta/Twilio | Não implementada                        |
| Simulador WhatsApp                           | Beta/dev-only                           |
| Painel Pro / billing                         | “Em breve” na landing, sem billing real |
| Exportação de rendas                         | Em breve                                |
| Insights avançados                           | Ainda heurísticos e simples             |
| Recuperação de senha                         | A confirmar                             |
| Página dedicada de despesas                  | A confirmar                             |

## 14. Dívidas técnicas e riscos conhecidos

- O warning `MSB3277` do EF Core no projeto de testes foi tratado recentemente; manter monitoramento em futuras mudanças de pacotes.
- Existe legado de variáveis/opções relacionadas a Supabase direto no frontend, mas o uso atual parece opcional/legado.
- `Salgadin-web/src/utils/supabase.ts` continua no repositório e parece não ser parte central do fluxo atual.
- Os insights do dashboard são úteis, mas heurísticos.
- O simulador WhatsApp depende de gating manual no backend; a documentação e os testes precisam continuar alinhados.
- `/health/ready` verifica conectividade com o banco, não schema/migrations.
- Exportação de rendas ainda não está pronta.
- O README do repositório pode ficar desatualizado com facilidade se não acompanhar a evolução do produto.

## 15. Próximos passos recomendados

Próximos passos realistas para o MVP:

1. consolidar o checklist operacional de produção antes de cada deploy
2. manter alinhamento de dependências EF Core/Npgsql e reduzir drift técnico
3. continuar refinando metas e alertas com edição/ações mais completas na UI
4. preparar um beta fechado do fluxo WhatsApp real, sem abrir para público geral cedo demais
5. adicionar métricas/analytics de produto para entender ativação e uso de features
6. evoluir exportação de dados:
   - renda em CSV
   - filtros mais claros
   - eventuais formatos adicionais
7. amadurecer a camada de billing/plano Pro quando a proposta comercial estiver mais clara
8. revisar pontos “a confirmar” deste documento conforme o código evoluir

## 16. Pontos a confirmar

Itens que merecem validação adicional antes de serem tratados como definitivos:

- existência de página dedicada de despesas fora do fluxo do dashboard/relatórios
- existência de fluxo formal de recuperação de senha
- eventual uso futuro ou legado efetivo de Supabase direto no frontend
