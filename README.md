# 🥟 Salgadin

**Salgadin** is a web-based personal finance management tool designed to help users take control of their daily spending with clear visual insights.

## 🌟 Features

- 📊 **Interactive Graphs**: Visualize how your daily expenses are distributed using dynamic charts.
- 🧾 **Daily Summaries**: Automatically receive a clear summary of your spending at the end of each day.
- 🏷️ **Spending Categories**: Organize your expenses into categories like Food, Transportation, Entertainment, and more.
- 🔍 **Top Spending Highlights**: Easily identify which categories consume most of your daily budget.

## 💡 Why "Salgadin"?

The name *"Salgadin"* comes from the Portuguese word for “savory snack” (salgadinho), like a pastel or coxinha. It’s a playful nod to those small, everyday purchases that seem harmless but quickly eat away at your budget.

## ⚙️ Tech Stack

- **Frontend**: React.js with TypeScript & Vite.
- **Styling**: Tailwind CSS.
- **Form Handling**: React Hook Form with Zod for validation.
- **Data Visualization**: Recharts.
- **HTTP Client**: Axios.
- **Backend**: C# with ASP.NET Core.
- **Database**: Supabase Postgres with Entity Framework Core and Npgsql.
- **Authentication**: JWT (JSON Web Tokens).
- **API Documentation**: Swagger/OpenAPI.
- **Logging**: Serilog.

## 🚀 Getting Started

Instructions on how to set up and run the project locally.

### Prerequisites

- .NET 9 SDK
- Node.js (v20 or newer)
- A Supabase project with the Postgres connection string

### Backend Setup

1.  Clone the repository:
    ```bash
    git clone [https://github.com/wmsalves/salgadin.git](https://github.com/wmsalves/salgadin.git)
    ```
2.  Navigate to the backend folder:
    ```bash
    cd salgadin/Salgadin
    ```
3.  Set local secrets with `dotnet user-secrets`:
    ```bash
    dotnet user-secrets set "SUPABASE_DB_CONNECTION" "Host=...;Port=6543;Database=postgres;Username=...;Password=...;SSL Mode=Require"
    dotnet user-secrets set "Jwt:Key" "YOUR_JWT_SECRET"
    dotnet user-secrets set "Authentication:Google:ClientId" "YOUR_GOOGLE_WEB_CLIENT_ID"
    ```
4.  For deployed environments, set the same values as platform environment variables instead of committing them to `appsettings.json`.
    `SUPABASE_DB_CONNECTION`, `ConnectionStrings__DefaultConnection`, `SUPABASE_DATABASE_URL`, `SUPABASE_CONNECTION_STRING`, `DATABASE_URL`, and `POSTGRES_URL` are supported. PostgreSQL URLs such as `postgresql://user:password@host:5432/postgres?sslmode=require` are normalized automatically.
    Recommended production envs for the backend are `SUPABASE_DB_CONNECTION`, `Jwt__Key`, `ASPNETCORE_ENVIRONMENT`, `CORS_ORIGINS`, and `Authentication__Google__ClientId` when Google Sign-In is enabled.
    If you want password recovery in production, also configure `PasswordReset__BaseUrl`, `PasswordReset__FromEmail`, `PasswordReset__FromName`, `PasswordReset__Smtp__Host`, `PasswordReset__Smtp__Port`, `PasswordReset__Smtp__Username`, `PasswordReset__Smtp__Password`, and `PasswordReset__Smtp__EnableSsl`.
5.  Apply EF Core migrations to create the database:
    ```bash
    dotnet ef database update
    ```
6.  Run the application:
    ```bash
    dotnet run
    ```
    The API will be available at `https://localhost:7XXX`.

Production deployment and migration guidance is documented in [docs/deployment/database.md](D:/Projetos/Salgadin/docs/deployment/database.md).
Use `Database__ApplyMigrationsOnStartup=true` only when you explicitly want the API to apply EF Core migrations during startup, such as a single-instance MVP deployment on Render.

The internal foundation for future WhatsApp expense capture is documented in [docs/integrations/whatsapp.md](docs/integrations/whatsapp.md).

### Frontend Setup

1.  In a new terminal, navigate to the frontend folder:
    ```bash
    cd salgadin/Salgadin-web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure local frontend environment variables:
    ```bash
    VITE_API_URL=http://localhost:5297/api
    VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
    VITE_ENABLE_WHATSAPP_SIMULATOR=true # optional, only for explicit simulator access outside dev
    ```
    Optional legacy/future envs, only if the frontend really uses Supabase directly:
    `VITE_SUPABASE_URL`
    `VITE_SUPABASE_PUBLISHABLE_KEY`
    Outside backend Development, the simulator endpoint also requires `WhatsApp__EnableSimulationEndpoint=true` and a backend-only allowlist in `WhatsApp__SimulatorAllowedEmails`.
4.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 📡 API Endpoints

A brief overview of the main API endpoints.

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate a user and receive a JWT.
- `POST /api/auth/google`: Authenticate with Google and receive the Salgadin JWT.
- `POST /api/auth/forgot-password`: Start the password recovery flow for local accounts.
- `POST /api/auth/reset-password`: Reset the password with a valid recovery token.
- `GET /api/expense`: Get a paginated list of expenses for the authenticated user.
- `POST /api/expense`: Create a new expense.
- `GET /api/expense/export`: Export authenticated user expenses.
- `GET /api/income/export`: Export authenticated user incomes.
- `GET /api/recurring-schedules`: List authenticated user recurring schedules.
- `POST /api/recurring-schedules`: Create a monthly recurring income or expense schedule.
- `POST /api/recurring-schedules/generate-due`: Materialize due recurring schedules as real incomes or expenses.
- `GET /api/category`: Get all categories for the authenticated user.
- `GET /health`: Liveness endpoint for production health checks.

> For complete and interactive API documentation, run the backend and navigate to the `/swagger` endpoint.

## WhatsApp Simulator

The WhatsApp simulator is an internal testing surface, not a public WhatsApp integration.

- Frontend visibility: `VITE_ENABLE_WHATSAPP_SIMULATOR=true` or local `Development`
- Backend enable flag outside `Development`: `WhatsApp__EnableSimulationEndpoint=true`
- Backend allowlist outside `Development`: `WhatsApp__SimulatorAllowedEmails=email1@example.com,email2@example.com`

For the full internal flow, see [docs/integrations/whatsapp.md](docs/integrations/whatsapp.md).

## Password Recovery

Password recovery is available for traditional email/password accounts.

- The API returns a generic response for `forgot-password`, whether the email exists or not.
- Recovery tokens are short-lived, single-use, and stored as hashes in the database.
- Google Sign-In continues to use the existing JWT flow and is not replaced by password recovery.
- In local `Development`, the API logs the recovery link instead of sending a real email.
- In non-development environments, password recovery requires the SMTP and base URL configuration listed above.
- Without that configuration in `Production`, the API returns a controlled unavailability response instead of silently pretending to send an email.
- The frontend routes involved are `/forgot-password` and `/reset-password?token=...`.

## 🔗 Prototype

You can explore the original design prototype here: [View Prototype on Figma](https://www.figma.com/proto/ltKDM5Wae13UCjR0x0EO0w/Salgadin?node-id=3-2&t=oBDb4l0VhiWuVYUk-1)
> 💡 *Note: This is a design mockup and may differ from the final implementation.*

## 📌 Project Status

> 🚧 Under active development. The core backend is robust, featuring logging, error handling, and a clean architecture. The UI for the landing page and authentication flow is complete and polished. Next step: Full integration between the frontend and backend.

## 🤝 Contributing

Pull requests and ideas are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License.
