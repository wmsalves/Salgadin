# Salgadin — Roadmap

## 1. Objetivo do roadmap

Este roadmap organiza a evolução do Salgadin a partir do estado atual do produto, com foco em um SaaS MVP de finanças pessoais que já possui base funcional relevante, mas ainda precisa de hardening operacional, refinamento de fluxos críticos e validação controlada de funcionalidades em desenvolvimento.

O objetivo não é listar tudo o que seria possível construir, e sim priorizar o que mais aumenta:

- confiabilidade em produção
- clareza de valor para o usuário
- segurança operacional
- maturidade de produto
- capacidade de aprender com uso real

## 2. Princípios de priorização

- confiabilidade antes de escala
- valor real antes de complexidade
- beta fechado antes de abertura pública
- clareza de dados antes de IA externa
- reduzir risco operacional antes de ampliar aquisição
- evoluir o produto com base no que já está implementado, sem prometer demais

## 3. Fase 0 — Hardening antes de divulgação

Objetivo:
Garantir que o produto esteja tecnicamente confiável antes de aumentar divulgação, tráfego ou aquisição de usuários.

### Itens prioritários

1. consolidar checklist pós-deploy como rotina operacional
2. validar env vars de frontend e backend em Vercel/Render
3. confirmar migrations aplicadas no Supabase a cada deploy
4. validar Google Sign-In em produção ponta a ponta
5. confirmar fallback SPA da Vercel em rotas públicas e protegidas
6. validar health checks:
   - `/health`
   - `/health/live`
   - `/health/ready`
7. garantir que o simulador WhatsApp não aparece para usuário comum
8. confirmar que o Render aponta para Supabase, não para conexão legada
9. rodar smoke test manual após cada deploy
10. manter documentação de deploy e troubleshooting alinhada com o comportamento real

### Critérios de aceite da fase

- deploy do backend sobe sem erro de schema ou connection string
- frontend abre corretamente em acesso direto a rotas como `/dashboard`, `/login`, `/signup`
- login tradicional funciona em produção
- login com Google funciona em produção
- dashboard carrega sem erro 500
- health checks respondem como esperado
- simulador WhatsApp continua restrito por ambiente e allowlist
- Open Graph image carrega corretamente no asset público

### Dependências

- acesso correto às variáveis de ambiente em Render e Vercel
- disciplina de aplicação de migrations
- checklist operacional sendo seguido pelo deploy owner

### Riscos

- drift entre documentação e configuração real de produção
- migrations esquecidas no banco
- regressão em Google Sign-In por env inconsistente
- endpoints internos expostos de forma indevida se o gating ficar desalinhado

## 4. Fase 1 — Melhorias de produto para MVP público

Objetivo:
Refinar a experiência para usuários reais sem expandir escopo demais.

### Itens prioritários

1. finalizar o fluxo de exportação de dados
   - manter exportação de despesas robusta
   - adicionar exportação de rendas em CSV
2. simplificar a experiência de metas
   - trocar limiar técnico `0-1` por percentuais compreensíveis
   - adicionar edição e ações mais claras na UI
3. revisar fluxos de despesas e rendas
   - confirmar se o produto precisa de páginas dedicadas
   - ou consolidar explicitamente o uso via dashboard/relatórios
4. revisar recuperação de senha
   - confirmar ausência/presença
   - implementar ou documentar claramente, se necessário
5. revisar mobile dos fluxos principais
   - dashboard
   - metas
   - categories
   - profile/settings
   - relatórios
6. refinar notificações e alertas
   - linguagem mais clara
   - ações mais úteis quando possível
7. evoluir insights heurísticos com baixo risco
   - sem IA externa
   - focando em leituras simples e acionáveis

### Critérios de aceite da fase

- usuário consegue completar fluxo principal sem ambiguidade:
  - entrar
  - registrar gasto
  - entender dashboard
  - criar meta
  - exportar seus dados
- principais empty states continuam claros
- mobile não apresenta quebras visuais relevantes
- metas e alertas ficam mais compreensíveis para usuário final
- não há aumento perceptível de complexidade operacional

### Dependências

- validação do fluxo real com uso manual
- confirmação de quais módulos merecem página dedicada
- manutenção do padrão de componentes compartilhados

### Riscos

- expandir demais o escopo da fase com features secundárias
- refatorar fluxo de despesas/rendas sem necessidade real
- introduzir UI mais “rica” mas menos clara

## 5. Fase 2 — Beta fechado WhatsApp

Objetivo:
Transformar a fundação já existente em um experimento real e controlado, com poucos usuários e risco operacional limitado.

### Itens prioritários

1. escolher provedor para beta real
   - Meta WhatsApp Cloud API
   - ou Twilio
2. implementar webhook seguro do provedor
3. validar assinatura/autenticidade das mensagens recebidas
4. reaproveitar a lógica já existente de parser e idempotência
5. suportar poucos comandos de alto valor
   - adicionar gasto
   - resumo de hoje
   - apagar último gasto
6. usar conexão por telefone/código de forma controlada
7. manter allowlist e beta fechado
8. criar logs suficientes para depurar falhas sem expor dados sensíveis

### Critérios de aceite da fase

- poucos usuários conseguem registrar despesa por mensagem real
- mensagens duplicadas não criam lançamentos duplicados
- usuário não consegue interferir em dados de outro usuário
- comandos básicos mais importantes funcionam
- falhas do provedor não quebram o restante do produto
- rollout fica restrito e reversível

### Dependências

- decisão sobre provedor
- número/canal oficial
- política clara de teste com poucos usuários
- observabilidade mínima do fluxo

### Riscos

- abrir cedo demais para usuários comuns
- subir complexidade operacional antes da validação do valor real
- lidar com edge cases conversacionais antes de consolidar o MVP

## 6. Fase 3 — Pós-MVP / Monetização

Objetivo:
Expandir o produto com base em aprendizado real, não só em intenção.

### Itens candidatos

1. plano Pro real
2. billing com Stripe
3. limites por plano
4. exportações avançadas
5. insights mais sofisticados
6. analytics de produto e eventos de ativação/retenção
7. mais automações ou integrações
8. refinamento comercial da landing com base em conversão real

### Critérios de aceite da fase

- existe sinal claro de retenção e uso recorrente
- proposta de valor do Pro está validada
- o produto já é operacionalmente estável
- a monetização não entra antes da confiança básica do usuário

### Dependências

- dados reais de uso
- hipótese comercial validada
- jornada principal bem resolvida

### Riscos

- monetizar cedo demais sem entender retenção
- adicionar billing complexo antes de clareza de oferta
- gastar esforço em “camadas premium” sem consolidar a base

## 7. Itens explicitamente fora do escopo agora

Os itens abaixo não devem ser prioridade imediata:

- IA externa para insights
- WhatsApp público aberto para qualquer usuário
- billing complexo antes da validação comercial
- app mobile nativo
- múltiplas moedas
- grande expansão de integrações paralelas
- reescrita arquitetural ampla sem necessidade

## 8. Próximas 5 tarefas recomendadas

### 1. Fechar a rotina operacional de produção

**Por quê**
É a maior alavanca de confiabilidade com baixo risco. O produto já tem boa base, mas deploy quebrado anula valor de qualquer feature nova.

**Inclui**
- seguir checklist pós-deploy
- revisar envs
- validar migrations
- revisar Google Sign-In em produção

### 2. Implementar exportação de rendas em CSV

**Por quê**
Fecha uma lacuna visível em Settings e aumenta sensação de maturidade do produto sem depender de escopo grande.

### 3. Simplificar o fluxo de metas para usuário final

**Por quê**
Metas já existem e já geram valor, mas ainda têm pontos de UX “técnicos”, como limiar `0-1`, além de espaço para edição mais direta.

### 4. Confirmar e tratar recuperação de senha

**Por quê**
É um requisito de confiança para um SaaS com autenticação real. Se estiver ausente, isso é uma lacuna importante para abertura mais ampla.

### 5. Preparar o plano do beta fechado de WhatsApp

**Por quê**
A fundação já existe. O próximo passo não é abrir para todos, e sim decidir provedor, escopo mínimo de comandos e critérios de teste controlado.

## 9. Resumo executivo do roadmap

Em ordem prática:

1. primeiro, endurecer produção e operação
2. depois, fechar lacunas de produto que impactam confiança e uso recorrente
3. em seguida, validar WhatsApp como beta fechado
4. só depois considerar monetização e camadas mais avançadas

Esse roadmap assume que o Salgadin já passou da fase de protótipo visual e está em uma fase de consolidação de MVP funcional.

