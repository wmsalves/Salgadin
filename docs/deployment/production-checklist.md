# Production Deployment Checklist

Use this checklist immediately after deploying:

- frontend on Vercel
- backend on Render
- database on Supabase Postgres

This document is a practical post-deploy validation flow.
For migration mechanics and startup validation details, see `docs/deployment/database.md`.

## 1. Expected production environment

### Vercel

Required:

- `VITE_API_URL`

Conditional:

- `VITE_GOOGLE_CLIENT_ID` when Google Sign-In is enabled

Optional, only if the frontend really queries Supabase directly:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Do not enable the WhatsApp simulator for normal public production use:

- `VITE_ENABLE_WHATSAPP_SIMULATOR` should be unset or `false`

### Render

Required:

- `SUPABASE_DB_CONNECTION`
- `Jwt__Key`
- `ASPNETCORE_ENVIRONMENT=Production`

Recommended:

- `Jwt__Issuer`
- `Jwt__Audience`
- `CORS_ORIGINS`
- `Authentication__Google__ClientId` when Google Sign-In is enabled

Optional operational flags:

- `Database__ApplyMigrationsOnStartup`
- `Database__ValidateSchemaOnStartup`
- `Database__FailOnPendingMigrations`
- `INTERNAL_HEALTH_TOKEN`

WhatsApp simulator flags must stay off for public production unless you are running a controlled internal test:

- `WhatsApp__EnableSimulationEndpoint`
- `WhatsApp__SimulatorAllowedEmails`

## 2. Backend health checks

After deploy, verify these endpoints manually:

### Public health

- `GET /health`
- `GET /health/live`
- `GET /health/ready`

Expected:

- `/health` returns `200`
- `/health/live` returns `200`
- `/health/ready` returns `200` only when the API can connect to PostgreSQL

Important:

- `/health/ready` validates database connectivity only
- `/health/ready` does not replace migration/schema validation

### Internal database health

Only if `INTERNAL_HEALTH_TOKEN` is configured:

- `GET /internal/health/database`
- Header: `X-Internal-Health-Token: <token>`

Expected:

- `200` when DB is reachable and there are no pending migrations
- `401` if token is missing or invalid
- `503` if DB is unreachable or migrations are pending

## 3. Supabase schema validation

Connect to the production Supabase database and verify:

### A. EF migration history exists

Run:

```sql
select *
from public."__EFMigrationsHistory"
order by "MigrationId";
```

Expected migrations:

- `20260323031243_InitialPostgres`
- `20260328001621_AddIncomeEntity`
- `20260328005237_AddUserFullName`
- `20260401123923_AddNotifications`
- `20260501194240_AddUserPhoneNumber`
- `20260501204442_AddGoogleAuthFields`
- `20260505230214_AddWhatsAppIntegrationFoundation`

### B. Application tables exist in `public`

Run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected core tables:

- `BudgetGoals`
- `Categories`
- `Expenses`
- `Incomes`
- `NotificationPreferences`
- `Notifications`
- `Subcategories`
- `Users`

### C. Render is pointing to Supabase, not Neon

Confirm the Render connection string host is the Supabase host or pooler host.

Expected examples:

- `aws-1-us-west-2.pooler.supabase.com`
- your Supabase PostgreSQL host

Do not leave old Neon values in production config.

## 4. Frontend checklist

Open the production Vercel URL and validate:

### Landing

- home page loads without `404`
- hero section renders correctly
- CTA buttons render and navigate correctly
- pricing shows `Free` and `Pro em breve`
- WhatsApp is presented as future/development, not active public integration
- FAQ expands normally

### Routing

Test direct access in a new tab:

- `/`
- `/login`
- `/signup`
- `/dashboard`

Expected:

- public routes load the SPA
- protected routes redirect or load correctly according to auth state
- Vercel does not return `404: NOT_FOUND` for SPA routes

### Authentication

#### Traditional login

- sign up works
- login works
- invalid login shows safe error message

#### Google Sign-In

Only if enabled:

- Google button appears
- Google login completes
- user lands on dashboard

### Dashboard

After login:

- dashboard loads without `500`
- month navigation works
- summary cards render
- cashflow chart renders or empty state is shown correctly
- financial insights card renders
- expenses by category card renders
- latest income and latest expenses render

### Profile / Settings

- profile/settings page loads
- profile fields load
- security section loads
- preferences section loads
- WhatsApp section loads

### WhatsApp simulator visibility

For a normal production user:

- WhatsApp simulator panel should not appear
- no dev-only simulator controls should be visible

### Open Graph image

Verify:

- `https://<your-vercel-domain>/og-image.png` loads
- social tags in page source point to PNG, not SVG
- sharing preview uses the current image

## 5. Backend behavior checklist

Verify after deploy:

- startup logs do not show connection string parsing errors
- startup logs do not show pending migration failure unless intentionally blocked
- Swagger is not publicly available in `Production`
- protected endpoints still require auth
- dev-only endpoints are not unintentionally exposed

Sensitive points to verify:

- `/api/dev/whatsapp/simulate` is not usable by an ordinary production user
- normal user data endpoints require JWT
- no public endpoint returns secrets or stack traces

## 6. Migrations and startup flow

Validate whichever strategy is currently active:

### Manual migration mode

If `Database__ApplyMigrationsOnStartup=false`:

- `dotnet ef database update` was executed against production before deploy
- startup succeeded
- `__EFMigrationsHistory` contains all expected migrations

### Startup migration mode

If `Database__ApplyMigrationsOnStartup=true`:

- Render startup logs show pending migrations being applied
- startup completes successfully
- `__EFMigrationsHistory` contains all expected migrations after boot

## 7. Smoke test manual

Run this minimal end-to-end smoke test:

1. Open the landing page
2. Open `/login`
3. Log in with a known test account
4. Confirm dashboard loads
5. Create one expense
6. Create one income
7. Open categories page
8. Open goals page
9. Open profile/settings
10. Return to dashboard and confirm the new data appears
11. Log out
12. Confirm protected pages are no longer accessible without auth

## 8. Failure checklist

If something failed, check in this order:

1. Render env vars
2. Supabase connection string host and credentials
3. `__EFMigrationsHistory`
4. `/health` and `/health/ready`
5. startup logs on Render
6. Vercel env vars
7. Google Sign-In config on both frontend and backend
8. SPA fallback on Vercel

## 9. Sign-off checklist

Mark production deploy as healthy only when all of the following are true:

- health endpoints respond as expected
- migrations are confirmed
- dashboard loads for a real user
- login works
- Google Sign-In works when enabled
- WhatsApp simulator is hidden from ordinary production users
- Open Graph image is reachable
- Render is connected to Supabase, not Neon
