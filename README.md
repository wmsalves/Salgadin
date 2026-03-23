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
- **Database**: Entity Framework Core with SQL Server.
- **Authentication**: JWT (JSON Web Tokens).
- **API Documentation**: Swagger/OpenAPI.
- **Logging**: Serilog.

## 🚀 Getting Started

Instructions on how to set up and run the project locally.

### Prerequisites

- .NET 8 SDK
- Node.js (v18 or newer)
- SQL Server (LocalDB or a full instance)

### Backend Setup

1.  Clone the repository:
    ```bash
    git clone [https://github.com/wmsalves/salgadin.git](https://github.com/wmsalves/salgadin.git)
    ```
2.  Navigate to the backend folder:
    ```bash
    cd salgadin/Salgadin
    ```
3.  Update the database connection string in `appsettings.json` if needed.
4.  Set environment variables:
    ```bash
    setx ConnectionStrings__DefaultConnection "Host=...;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
    setx Jwt__Key "YOUR_JWT_SECRET"
    ```
5.  Apply EF Core migrations to create the database:
    ```bash
    dotnet ef database update
    ```
6.  Run the application:
    ```bash
    dotnet run
    ```
    The API will be available at `https://localhost:7XXX`.

### Frontend Setup

1.  In a new terminal, navigate to the frontend folder:
    ```bash
    cd salgadin/Salgadin-web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 📡 API Endpoints

A brief overview of the main API endpoints.

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate a user and receive a JWT.
- `GET /api/expenses`: Get a paginated list of expenses for the authenticated user.
- `POST /api/expenses`: Create a new expense.
- `GET /api/categories`: Get all categories for the authenticated user.

> For complete and interactive API documentation, run the backend and navigate to the `/swagger` endpoint.

## 🔗 Prototype

You can explore the original design prototype here: [View Prototype on Figma](https://www.figma.com/proto/ltKDM5Wae13UCjR0x0EO0w/Salgadin?node-id=3-2&t=oBDb4l0VhiWuVYUk-1)
> 💡 *Note: This is a design mockup and may differ from the final implementation.*

## 📌 Project Status

> 🚧 Under active development. The core backend is robust, featuring logging, error handling, and a clean architecture. The UI for the landing page and authentication flow is complete and polished. Next step: Full integration between the frontend and backend.

## 🤝 Contributing

Pull requests and ideas are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License.
