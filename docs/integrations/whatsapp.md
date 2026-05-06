# WhatsApp Integration Foundation

This document describes the internal WhatsApp foundation for Salgadin.

The current implementation does not integrate with Meta WhatsApp Cloud API or Twilio. It only prepares the backend architecture and provides a local simulation endpoint for validating the future flow.

## Goal

Allow a user to register small daily expenses from messages such as:

- `Adicionar 50 em almoço`
- `Adicionar 50 reais em almoço`
- `Gastei 25 com Uber`
- `Paguei 120 no mercado`
- `50 café`
- `Mercado 89,90`

## Data model

The EF Core migration creates:

- `UserWhatsAppAccounts`
  - links a Salgadin user to a normalized phone number.
- `WhatsAppLinkCodes`
  - stores temporary connection codes such as `SALGADIN-482913`.
- `WhatsAppProcessedMessages`
  - stores provider message IDs for idempotency.

EF Core migrations remain the source of truth for this schema.

## Authenticated user endpoints

All endpoints below require the normal Salgadin JWT.

### Generate link code

```http
POST /api/whatsapp/link-code
Authorization: Bearer <token>
```

Response:

```json
{
  "code": "SALGADIN-482913",
  "expiresAt": "2026-05-05T23:15:00Z"
}
```

Current MVP behavior:

- the endpoint requires the user to have a valid phone number saved in Profile;
- the endpoint creates or reactivates the local `UserWhatsAppAccount` for simulation;
- the code expires in 15 minutes;
- the code is not sent to Meta/Twilio yet.

### Check status

```http
GET /api/whatsapp/status
Authorization: Bearer <token>
```

Response:

```json
{
  "connected": true,
  "phoneNumber": "+5531999999999"
}
```

### Disconnect

```http
DELETE /api/whatsapp/disconnect
Authorization: Bearer <token>
```

This deactivates the active WhatsApp link for the authenticated user.

## Local simulation endpoint

The simulation endpoint is available only in `Development` by default.

It can be explicitly enabled outside Development with:

```text
WhatsApp__EnableSimulationEndpoint=true
```

Outside Development, enabling the endpoint is not enough. The caller must also be authenticated with the normal Salgadin JWT and the authenticated email must be present in:

```text
WhatsApp__SimulatorAllowedEmails=email1@example.com,email2@example.com
```

Use this only for controlled testing. Do not expose broad access in production.

Frontend visibility is controlled separately:

```text
VITE_ENABLE_WHATSAPP_SIMULATOR=true
```

For production or staging tests, all three settings must be coherent:

- `VITE_ENABLE_WHATSAPP_SIMULATOR=true` shows the panel in the frontend.
- `WhatsApp__EnableSimulationEndpoint=true` enables the backend endpoint outside Development.
- `WhatsApp__SimulatorAllowedEmails=...` defines which authenticated users can call it.

The allowed email list is backend-only and must not be exposed to the frontend.

### Simulate incoming message

```http
POST /api/dev/whatsapp/simulate
Content-Type: application/json

{
  "from": "+5531999999999",
  "text": "Adicionar 50 em almoço",
  "messageId": "test-001"
}
```

Success response:

```json
{
  "reply": "Despesa adicionada: R$ 50,00 em almoço."
}
```

Duplicate message response:

```json
{
  "reply": "Mensagem ja processada. Nenhuma despesa duplicada foi criada."
}
```

Unlinked phone response:

```json
{
  "reply": "Este telefone ainda nao esta conectado ao Salgadin."
}
```

Unauthorized simulator user response:

```http
403 Forbidden
```

The frontend should show a friendly message such as:

```text
Seu usuário não está autorizado a usar o simulador WhatsApp neste ambiente.
```

## Parser behavior

The parser extracts:

- `amount`
- `description`
- `inferredCategoryName`
- `date`, using current UTC time

Supported amount formats:

- `50`
- `89,90`
- `89.90`

Ignored words:

- `adicionar`
- `gastei`
- `paguei`
- `reais`
- `real`
- `em`
- `com`
- `no`
- `na`

Category inference:

- `Alimentacao`: almoço, jantar, café, lanche, mercado, padaria, ifood, restaurante
- `Transporte`: uber, ônibus, gasolina, transporte, estacionamento
- `Lazer`: cinema, netflix, show, jogo
- `Outros`: fallback

The service tries to find a matching user category by name. If the inferred category does not exist, it tries `Outros` or `Other`. It does not create categories automatically.

## Idempotency

`messageId` is stored in `WhatsAppProcessedMessages.ProviderMessageId`.

If the same message ID is received again, the service returns a duplicate response and does not create another expense.

## Local test flow

1. Start the API in Development.
2. Log in normally and save a valid phone number in Profile.
3. Generate a link code:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:5297/api/whatsapp/link-code `
  -Headers @{ Authorization = "Bearer <token>" }
```

4. Simulate a message:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:5297/api/dev/whatsapp/simulate `
  -ContentType "application/json" `
  -Body '{"from":"+5531999999999","text":"Adicionar 50 em almoço","messageId":"test-001"}'
```

Use the normalized phone returned by `/api/whatsapp/status` as `from`.

## Future Meta/Twilio steps

Next steps for a real integration:

1. Add provider webhook signature validation.
2. Add provider-specific message DTO mapping.
3. Replace `/api/dev/whatsapp/simulate` with a secured webhook endpoint.
4. Use `WhatsAppLinkCodes` to confirm the first message from a real phone.
5. Store provider message IDs in `WhatsAppProcessedMessages`.
6. Add conversation state only if multi-step flows become necessary.
