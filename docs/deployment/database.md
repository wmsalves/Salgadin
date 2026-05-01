# Database Deployment Guide

This project uses Entity Framework Core migrations as the source of truth for the PostgreSQL schema.

## Recommended strategy

Production flow:

1. Apply migrations explicitly with EF Core before or during the deployment operation.
2. Start the API.
3. Let the API validate database connectivity and pending migrations on startup.

The API is configured to fail fast in `Production` when:

- the database is unreachable; or
- there are pending EF Core migrations.

That prevents Render from serving the API against an empty or outdated Supabase database.

When explicitly enabled, the API can also apply pending EF Core migrations during startup before it begins accepting requests.

## Source of truth

Do not create or alter application tables manually in Supabase when they already belong to the EF Core model.

The expected schema is defined by:

- entities in `Salgadin/Models`
- `DbSet<>` registrations in `Salgadin/Data/SalgadinContext.cs`
- migrations in `Salgadin/Migrations`

## Required environment variables

### Render

Required:

- `SUPABASE_DB_CONNECTION`
- `Jwt__Key`
- `ASPNETCORE_ENVIRONMENT`

Recommended:

- `Jwt__Issuer`
- `Jwt__Audience`
- `CORS_ORIGINS`

Optional:

- `INTERNAL_HEALTH_TOKEN`
- `Database__ValidateSchemaOnStartup`
- `Database__FailOnPendingMigrations`
- `Database__ApplyMigrationsOnStartup`

Emergency override:

- set `Database__ValidateSchemaOnStartup=false` only as a temporary operational exception.
- this disables the startup schema guard, but does not change the default production behavior.

Startup migration modes:

- conservative production: `Database__ApplyMigrationsOnStartup=false`
  - apply migrations manually with `dotnet ef database update`
  - the API refuses to start if migrations are pending
- single-instance MVP on Render: `Database__ApplyMigrationsOnStartup=true`
  - the API applies pending migrations on startup
  - if migration application fails, startup fails and the service does not accept requests

### Vercel

Required:

- `VITE_API_URL`

Optional, only if the frontend really queries Supabase directly:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Supabase connection string format

Use the Npgsql format for the Supabase pooler:

```text
Host=aws-1-us-west-2.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.<project-ref>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true
```

Notes:

- `Host` must be the Supabase pooler host.
- `Port` is typically `6543` for the pooler.
- `Database` is usually `postgres`.
- `Username` usually follows the `postgres.<project-ref>` format.
- Do not commit this value to `appsettings.json`.

The application also accepts PostgreSQL URL format and normalizes it internally, but the Npgsql key/value format is less error-prone for operations.

## Startup migration behavior

Configuration key:

```text
Database:ApplyMigrationsOnStartup
```

Environment variable form:

```text
Database__ApplyMigrationsOnStartup
```

Behavior:

- when `true`:
  - startup creates a scope
  - verifies database connectivity
  - logs pending migrations
  - runs `db.Database.MigrateAsync()`
  - logs success
  - aborts startup if migration application fails
- when `false`:
  - startup does not mutate schema
  - pending migrations still fail startup in production when validation is enabled

## Official migration command

Run migrations from a machine or CI environment that has the .NET SDK and network access to the Supabase database:

```powershell
$env:SUPABASE_DB_CONNECTION="Host=...;Port=6543;Database=postgres;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
dotnet ef database update --project .\Salgadin\Salgadin.csproj --startup-project .\Salgadin\Salgadin.csproj
```

Why this matters:

- the Render runtime container uses the ASP.NET runtime image, not the .NET SDK image;
- `dotnet ef` is therefore an operational command to run from your workstation or CI, not inside the live web container.

## Generate SQL script

If you need a SQL artifact for review or DBA validation, generate it from EF Core:

```powershell
dotnet ef migrations script --project .\Salgadin\Salgadin.csproj --startup-project .\Salgadin\Salgadin.csproj -o .\Salgadin\migration.sql
```

Do not treat `migration.sql` as the primary deployment path. The primary source of truth remains EF Core migrations.

## Validate schema in Supabase

### List tables in `public`

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected application tables:

- `BudgetGoals`
- `Categories`
- `Expenses`
- `Incomes`
- `NotificationPreferences`
- `Notifications`
- `Subcategories`
- `Users`

### Check EF Core migration history

```sql
select *
from public."__EFMigrationsHistory"
order by "MigrationId";
```

Expected migrations today:

- `20260323031243_InitialPostgres`
- `20260328001621_AddIncomeEntity`
- `20260328005237_AddUserFullName`
- `20260401123923_AddNotifications`

## Internal database health endpoint

If `INTERNAL_HEALTH_TOKEN` is configured, the API exposes:

```text
GET /internal/health/database
Header: X-Internal-Health-Token: <token>
```

Behavior:

- returns `200` when the database is reachable and there are no pending migrations;
- returns `503` when the database is unreachable or schema is outdated;
- returns `401` when the token is missing or invalid;
- never returns connection strings, secrets, or user data.

This endpoint is intentionally minimal and hidden from Swagger.

## Local workflow

1. Set local secrets:

```powershell
dotnet user-secrets set "SUPABASE_DB_CONNECTION" "Host=...;Port=6543;Database=postgres;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true" --project .\Salgadin\Salgadin.csproj
dotnet user-secrets set "Jwt:Key" "<64-byte-or-longer-secret>" --project .\Salgadin\Salgadin.csproj
```

2. Apply migrations:

```powershell
dotnet ef database update --project .\Salgadin\Salgadin.csproj --startup-project .\Salgadin\Salgadin.csproj
```

3. Run the API:

```powershell
dotnet run --project .\Salgadin\Salgadin.csproj
```

If you want startup validation outside production, set:

```powershell
$env:Database__ValidateSchemaOnStartup="true"
```

## Render deployment steps

1. Confirm Render environment variables are configured.
2. From your workstation or CI, point `SUPABASE_DB_CONNECTION` to the production database.
3. Run:

```powershell
dotnet ef database update --project .\Salgadin\Salgadin.csproj --startup-project .\Salgadin\Salgadin.csproj
```

4. Deploy the API on Render.
5. Verify the service starts successfully.
6. Optionally call the internal health endpoint if `INTERNAL_HEALTH_TOKEN` is configured.

For a Render single-instance MVP flow, you may set:

```text
Database__ApplyMigrationsOnStartup=true
```

That lets the container apply pending EF Core migrations before serving traffic. For stricter production operations, leave it `false` and keep manual migration application in CI or from a workstation.

## Post-deploy checklist

- `SUPABASE_DB_CONNECTION` points to the correct Supabase project
- `Jwt__Key` is present and at least 64 bytes for HS512
- `Jwt__Issuer` and `Jwt__Audience` are set if token validation should enforce them
- `CORS_ORIGINS` includes the Vercel frontend origin
- `dotnet ef database update` completed successfully against production
- `public."__EFMigrationsHistory"` contains all expected migrations
- the application tables exist in `public`
- Render boot logs do not show pending migration or connection errors
- login works
- user registration works
- creating an expense works
- creating an income works

## Troubleshooting

### `Jwt:Key must be at least 64 bytes for HS512`

Cause:

- the configured JWT secret is too short.

Action:

- replace `Jwt__Key` with a 64-byte or longer secret.

### `Network is unreachable`

Cause:

- network path to Supabase is unavailable from the current environment.

Action:

- verify Supabase host, internet egress, DNS resolution, and platform connectivity.

### `Format of the initialization string does not conform to specification`

Cause:

- malformed connection string.

Action:

- recheck separators, key names, host, port, username, password, and quoting.

### `Tenant or user not found`

Cause:

- wrong Supabase username, password, host, or project reference.

Action:

- confirm the exact pooler host and the `postgres.<project-ref>` username supplied by Supabase.

### `relation "Users" does not exist`

Cause:

- migrations were not applied to the production database; or
- the API is connected to the wrong database.

Action:

- confirm `SUPABASE_DB_CONNECTION`;
- run `dotnet ef database update`;
- verify `public."__EFMigrationsHistory"` and the expected tables.
