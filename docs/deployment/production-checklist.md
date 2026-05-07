# Salgadin — Production Checklist

Este documento transforma a Fase 0 do roadmap em um checklist operacional para validar a produção após cada deploy.

Escopo atual:

- frontend em Vercel
- backend em Render
- banco em Supabase Postgres
- autenticação tradicional + Google Sign-In
- JWT próprio
- EF Core migrations
- health checks
- Open Graph image
- fundação WhatsApp com simulador restrito

Use este checklist imediatamente depois de:

- deploy do frontend
- deploy do backend
- mudança de env vars
- aplicação de migrations

Para detalhes de migrations, startup validation e readiness, consulte também:

- `docs/deployment/database.md`
- `docs/product/product-context.md`
- `docs/product/roadmap.md`

---

## 1. Pré-requisitos antes da validação

Antes de começar a validação pós-deploy, confirme:

- o deploy do frontend terminou sem erro na Vercel
- o deploy do backend terminou sem erro no Render
- o banco de produção correto é o Supabase
- a estratégia de migrations da release atual é conhecida:
  - manual com `dotnet ef database update`
  - ou startup com `Database__ApplyMigrationsOnStartup=true`

Tenha em mãos:

- URL pública do frontend
- URL pública do backend
- acesso ao painel da Vercel
- acesso ao painel da Render
- acesso ao projeto do Supabase
- uma conta de teste válida
- um usuário comum não autorizado para testar o gating do simulador, quando aplicável

---

## 2. Checklist de variáveis de ambiente

### 2.1 Vercel

Confirmar:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID` quando Google Sign-In estiver ativo

Normalmente em produção:

- `VITE_ENABLE_WHATSAPP_SIMULATOR` ausente
- ou `VITE_ENABLE_WHATSAPP_SIMULATOR=false`

Observações:

- `VITE_API_URL` deve apontar para a API pública correta da Render
- `VITE_GOOGLE_CLIENT_ID` deve ser compatível com o mesmo client configurado no backend
- não habilitar o simulador WhatsApp no frontend para uso público comum

### 2.2 Render

Confirmar:

- `SUPABASE_DB_CONNECTION`
- `Jwt__Key`
- `ASPNETCORE_ENVIRONMENT=Production`
- `CORS_ORIGINS`
- `Authentication__Google__ClientId` quando Google Sign-In estiver ativo
- `Database__ApplyMigrationsOnStartup`
- `Database__ValidateSchemaOnStartup`

Somente para cenários controlados:

- `WhatsApp__EnableSimulationEndpoint`
- `WhatsApp__SimulatorAllowedEmails`

Observações:

- `SUPABASE_DB_CONNECTION` deve apontar para Supabase, não Neon
- `Jwt__Key` deve ser longo o bastante para HS512
- `CORS_ORIGINS` deve incluir o domínio final da Vercel
- se `WhatsApp__EnableSimulationEndpoint` estiver ativo fora de Development, a allowlist deve existir e ser restrita

---

## 3. Checklist de banco / Supabase

### 3.1 Confirmar que Render aponta para Supabase

No painel da Render, valide a connection string configurada.

O host deve ser do Supabase, por exemplo:

- `aws-1-us-west-2.pooler.supabase.com`
- ou o host PostgreSQL do Supabase correspondente ao projeto

Não aceitar:

- host legado de Neon
- string antiga reaproveitada por engano

### 3.2 Validar `__EFMigrationsHistory`

Rodar no SQL editor do Supabase:

```sql
select *
from public."__EFMigrationsHistory"
order by "MigrationId";
```

Confirmar a presença das migrations atuais:

- `20260323031243_InitialPostgres`
- `20260328001621_AddIncomeEntity`
- `20260328005237_AddUserFullName`
- `20260401123923_AddNotifications`
- `20260501194240_AddUserPhoneNumber`
- `20260501204442_AddGoogleAuthFields`
- `20260505230214_AddWhatsAppIntegrationFoundation`

### 3.3 Confirmar schema esperado

Rodar:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Confirmar pelo menos as tabelas principais:

- `Users`
- `Categories`
- `Subcategories`
- `Expenses`
- `Incomes`
- `BudgetGoals`
- `NotificationPreferences`
- `Notifications`
- `UserWhatsAppAccounts`
- `WhatsAppLinkCodes`
- `WhatsAppProcessedMessages`

### 3.4 Confirmar que não há migrations pendentes

Validar de acordo com a estratégia da release:

#### Se a estratégia é manual

- `dotnet ef database update` foi executado antes do deploy
- a API subiu sem erro de migration pendente

#### Se a estratégia é automática no startup

- logs da Render mostram aplicação bem-sucedida das migrations
- a API sobe completamente depois da aplicação

Importante:

- `/health/ready` não substitui essa validação
- conectividade com banco não significa schema correto

---

## 4. Checklist de backend

### 4.1 Health checks

Validar:

- `GET /health`
- `GET /health/live`
- `GET /health/ready`

Esperado:

- `/health` retorna `200`
- `/health/live` retorna `200`
- `/health/ready` retorna `200` quando o banco está acessível

Importante:

- `/health/ready` verifica conectividade com PostgreSQL
- `/health/ready` não garante ausência de migrations pendentes

### 4.2 Swagger

Em produção:

- Swagger não deve estar disponível publicamente

Validar:

- acesso ao endpoint `/swagger`

Esperado:

- não exposto em `Production`

### 4.3 Autenticação

Validar:

- `POST /api/auth/register` funciona
- `POST /api/auth/login` funciona
- `POST /api/auth/google` funciona quando configurado
- `GET /api/auth/me` exige JWT válido

### 4.4 Endpoints sensíveis protegidos

Validar que continuam exigindo autenticação:

- `/api/expense`
- `/api/category`
- `/api/goals`
- `/api/notifications`
- `/api/reports`
- `/api/whatsapp/status`
- `/api/whatsapp/link-code`

Esperado:

- usuário sem token não acessa dados
- usuário autenticado acessa apenas os próprios dados

### 4.5 Simulador WhatsApp fora de Development

Validar comportamento em produção comum:

- um usuário comum não autorizado não consegue usar `POST /api/dev/whatsapp/simulate`

Esperado:

- se o endpoint estiver desabilitado: `404`
- se o endpoint estiver habilitado fora de Development:
  - usuário não autenticado: `401`
  - usuário autenticado mas não autorizado: `403`

Esse teste é importante para garantir que esconder a UI no frontend não é a única proteção.

---

## 5. Checklist de frontend

### 5.1 Landing page

Validar:

- home pública carrega
- hero renderiza corretamente
- CTAs principais aparecem
- seções de benefícios, como funciona, pricing e FAQ carregam
- pricing mostra `Free` e `Pro em breve`
- WhatsApp é comunicado como futuro/desenvolvimento, não como feature pública já ativa

### 5.2 Rotas públicas

Testar acesso direto em nova aba:

- `/`
- `/login`
- `/signup`
- `/terms`
- `/privacy`

Esperado:

- todas carregam via SPA
- sem `404: NOT_FOUND` da Vercel

### 5.3 Login tradicional

Validar:

- cadastro de usuário teste
- login com email/senha
- mensagem de erro segura para credencial inválida

### 5.4 Google Sign-In

Se habilitado:

- botão aparece
- fluxo do Google conclui corretamente
- usuário cai no dashboard autenticado

### 5.5 Dashboard

Após login:

- `/dashboard` abre
- não aparece erro 500
- KPIs carregam
- gráfico de fluxo de caixa aparece ou mostra empty state coerente
- card de insights aparece quando há dados
- alertas/metas aparecem de forma coerente

### 5.6 Profile / Settings

Validar:

- `/perfil` abre
- dados de perfil carregam
- seção de segurança carrega
- seção de preferências carrega
- seção de WhatsApp carrega
- exportação de despesas está visível

### 5.7 Open Graph image

Validar:

- `/og-image.png` abre diretamente
- o arquivo existe publicamente na Vercel
- a página usa PNG nas meta tags sociais

### 5.8 Simulador WhatsApp no frontend

Para usuário comum em produção:

- o painel do simulador não deve aparecer
- campos técnicos como `from`, `messageId` e mensagem simulada não devem estar visíveis

---

## 6. Smoke test manual

Executar pelo menos este fluxo após o deploy:

1. abrir a landing pública
2. abrir `/terms`
3. abrir `/privacy`
4. criar um usuário teste
5. fazer login
6. confirmar que o dashboard abre
7. adicionar uma renda
8. adicionar uma despesa
9. verificar se o dashboard atualiza
10. criar uma meta
11. acessar relatórios
12. exportar CSV de despesas
13. acessar Profile/Settings
14. fazer logout
15. fazer login novamente
16. confirmar que os dados continuam acessíveis corretamente

Se Google Sign-In estiver ativo, complementar:

17. testar login com Google em uma conta de teste

---

## 7. Troubleshooting

### 7.1 Dashboard retorna 500

Verificar:

- logs da Render
- `/health/ready`
- connection string em `SUPABASE_DB_CONNECTION`
- migrations aplicadas
- erro de datas UTC em endpoints de despesas, se houver regressão

### 7.2 Google Sign-In inválido

Verificar:

- `VITE_GOOGLE_CLIENT_ID` na Vercel
- `Authentication__Google__ClientId` na Render
- se ambos apontam para o mesmo client correto
- se o domínio/origem está configurado corretamente no Google

### 7.3 Migration pendente

Sintomas típicos:

- startup falha
- tabela não existe
- logs mostram pending migrations

Verificar:

- `__EFMigrationsHistory`
- estratégia da release (`manual` ou `startup`)
- logs da Render

### 7.4 Frontend chamando API errada

Sintomas típicos:

- login falha sem razão aparente
- dashboard vazio por erro de rede
- CORS inesperado

Verificar:

- `VITE_API_URL`
- se a URL aponta para a API correta da Render
- se não ficou apontando para localhost ou API antiga

### 7.5 CORS

Sintomas típicos:

- requests bloqueados no browser
- preflight falhando

Verificar:

- `CORS_ORIGINS` na Render
- domínio exato da Vercel
- se há ambiente preview/domínio alternativo sendo usado

### 7.6 Token antigo no localStorage

Sintomas típicos:

- UI logada mas backend responde `401`
- comportamento inconsistente após mudança de auth/config

Ação:

- limpar storage local
- fazer login novamente

### 7.7 Render usando banco errado

Sintomas típicos:

- deploy sobe, mas dados somem
- tabelas parecem faltar
- usuário enxerga ambiente “zerado”

Verificar:

- host do `SUPABASE_DB_CONNECTION`
- projeto correto no Supabase
- `__EFMigrationsHistory`
- presença dos dados esperados

---

## 8. Critério final de sign-off

Um deploy só deve ser considerado saudável quando:

- frontend carrega corretamente
- `/terms` e `/privacy` funcionam
- login tradicional funciona
- Google Sign-In funciona, se ativo
- dashboard abre após login
- Profile/Settings carrega
- `/health`, `/health/live` e `/health/ready` respondem como esperado
- schema no Supabase está confirmado
- Render aponta para Supabase, não Neon
- Swagger não está exposto em `Production`
- simulador WhatsApp não aparece para usuário comum
- um usuário comum não autorizado não consegue usar o simulador WhatsApp fora de Development
- smoke test manual principal foi concluído

