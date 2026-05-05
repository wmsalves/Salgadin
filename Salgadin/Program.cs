using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Salgadin.Configuration;
using Salgadin.Data;
using Salgadin.Mappings;
using Salgadin.Repositories;
using Salgadin.Services;
using Salgadin.Validators;
using Serilog;
using QuestPDF.Infrastructure;
using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.RateLimiting;

// Configura um logger inicial para capturar erros durante a inicialização.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Iniciando a aplicação Salgadin.");

    var builder = WebApplication.CreateBuilder(args);

    // Configura o Serilog para ser o provedor de logging principal da aplicação.
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // ----- Services -----

    // Configura a licença do QuestPDF (Community).
    QuestPDF.Settings.License = LicenseType.Community;

    // Configura o Entity Framework Core para usar o PostgreSQL.
    var databaseConnectionString = DatabaseConnectionString.Resolve(builder.Configuration);
    builder.Services.AddDbContext<SalgadinContext>(options =>
        options.UseNpgsql(databaseConnectionString));


    // Registra os perfis de mapeamento do AutoMapper.
    builder.Services.AddAutoMapper(_ => { }, typeof(AutoMapperProfile).Assembly);

    // Registra a Unit of Work com um tempo de vida "scoped".
    builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

    // Registra os servios da aplicao.
    builder.Services.AddScoped<IExpenseService, ExpenseService>();
    builder.Services.AddScoped<IIncomeService, IncomeService>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();
    builder.Services.AddScoped<ISubcategoryService, SubcategoryService>();
    builder.Services.AddScoped<IReportService, ReportService>();
    builder.Services.AddScoped<IGoalService, GoalService>();
    builder.Services.AddScoped<IExportService, ExportService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IUserContextService, UserContextService>();
    builder.Services.AddScoped<IGoogleTokenValidator, GoogleTokenValidator>();
    builder.Services.AddSingleton<IWhatsAppExpenseMessageParser, WhatsAppExpenseMessageParser>();
    builder.Services.AddScoped<IWhatsAppIntegrationService, WhatsAppIntegrationService>();

    // Permite o acesso ao HttpContext nos serviços.
    builder.Services.AddHttpContextAccessor();

    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter("LoginPolicy", opt =>
        {
            opt.PermitLimit = 5;
            opt.Window = TimeSpan.FromMinutes(1);
            opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
            opt.QueueLimit = 0;
        });
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    });

    // Registra os validadores do FluentValidation.
    builder.Services.AddValidatorsFromAssemblyContaining<UserRegisterDtoValidator>();
    // Habilita a validação automática via FluentValidation.
    builder.Services.AddFluentValidationAutoValidation();

    // Adiciona os serviços dos controllers da API.
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        });

    builder.Services.AddEndpointsApiExplorer();

    // Suporte a proxy reverso para HTTPS correto.
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
    });

    // Configura a autenticação via JWT Bearer Token.
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            var keyString = builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key not configured");
            var keyBytes = Encoding.UTF8.GetBytes(keyString);
            if (keyBytes.Length < 64)
            {
                throw new InvalidOperationException("Jwt:Key must be at least 64 bytes for HS512.");
            }

            var issuer = builder.Configuration["Jwt:Issuer"];
            var audience = builder.Configuration["Jwt:Audience"];

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                ValidateIssuer = !string.IsNullOrWhiteSpace(issuer),
                ValidIssuer = issuer,
                ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                ValidAudience = audience,
                ValidateLifetime = true,
                RequireExpirationTime = true,
                ClockSkew = TimeSpan.FromMinutes(2)
            };
        });

    // Define uma política de CORS para permitir requisições do frontend.
    var corsPolicy = "_salgadinCors";
    var corsOrigins = builder.Configuration["CORS_ORIGINS"]?
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        ?? new[]
        {
            "http://localhost:5173",
            "http://localhost:3000",
            "https://salgadin.vercel.app"
        };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy(corsPolicy, policy =>
        {
            policy
                .WithOrigins(corsOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // Configura o Swagger para documentação da API.
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Salgadin API", Version = "v1" });

        var jwtSecurityScheme = new OpenApiSecurityScheme
        {
            Scheme = "bearer",
            BearerFormat = "JWT",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Description = "Insira **APENAS** o seu token JWT Bearer abaixo",
            Reference = new OpenApiReference
            {
                Id = JwtBearerDefaults.AuthenticationScheme,
                Type = ReferenceType.SecurityScheme
            }
        };

        c.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            { jwtSecurityScheme, Array.Empty<string>() }
        });
    });

    var app = builder.Build();

    var startupValidationOptions = DatabaseStartupValidationOptions.FromConfiguration(app.Configuration, app.Environment);
    app.Logger.LogInformation(
        "Salgadin API startup. Environment={EnvironmentName}; ApplyMigrationsOnStartup={ApplyMigrationsOnStartup}; ValidateSchemaOnStartup={ValidateSchemaOnStartup}.",
        app.Environment.EnvironmentName,
        startupValidationOptions.ApplyMigrationsOnStartup,
        startupValidationOptions.ValidateSchemaOnStartup);

    await DatabaseStartupValidator.EnsureReadyAsync(app);

    // ----- Middleware pipeline -----

    // Adiciona o middleware do Serilog para logar informações de cada requisição.
    app.UseSerilogRequestLogging();

    // Adiciona o middleware global para tratamento de erros.
    app.UseMiddleware<ErrorHandlingMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseForwardedHeaders();
    app.UseHttpsRedirection();

    app.UseRouting();

    // Ativa o RateLimiter (Deve vir apos o routing)
    app.UseRateLimiter();

    // Aplica a política de CORS.
    app.UseCors(corsPolicy);

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapGet("/health", () => Results.Ok(CreateHealthResponse("healthy")))
        .AllowAnonymous()
        .ExcludeFromDescription();

    app.MapGet("/health/live", () => Results.Ok(CreateHealthResponse("healthy")))
        .AllowAnonymous()
        .ExcludeFromDescription();

    app.MapGet("/health/ready", async (
        SalgadinContext dbContext,
        ILoggerFactory loggerFactory,
        CancellationToken cancellationToken) =>
    {
        var logger = loggerFactory.CreateLogger("HealthChecks");

        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);

            if (!canConnect)
            {
                logger.LogWarning("Readiness health check failed because the database is unreachable.");
                return Results.Json(
                    CreateReadinessResponse("unhealthy", "unhealthy"),
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }

            return Results.Ok(CreateReadinessResponse("healthy", "healthy"));
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Readiness health check failed while validating database connectivity.");
            return Results.Json(
                CreateReadinessResponse("unhealthy", "unhealthy"),
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }
    })
    .AllowAnonymous()
    .ExcludeFromDescription();

    var internalHealthToken = app.Configuration["INTERNAL_HEALTH_TOKEN"];
    if (!string.IsNullOrWhiteSpace(internalHealthToken))
    {
        app.MapGet("/internal/health/database", async (HttpContext httpContext, SalgadinContext dbContext, CancellationToken cancellationToken) =>
        {
            if (!httpContext.Request.Headers.TryGetValue("X-Internal-Health-Token", out var providedToken) ||
                !FixedTimeEquals(providedToken.ToString(), internalHealthToken))
            {
                return Results.Unauthorized();
            }

            try
            {
                var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
                var pendingMigrationCount = canConnect
                    ? (await dbContext.Database.GetPendingMigrationsAsync(cancellationToken)).Count()
                    : -1;

                return canConnect && pendingMigrationCount == 0
                    ? Results.Ok(new
                    {
                        status = "ok",
                        database = "reachable",
                        pendingMigrations = pendingMigrationCount
                    })
                    : Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
            }
            catch
            {
                return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
            }
        })
        .ExcludeFromDescription();
    }

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    // Captura e loga qualquer erro fatal durante a inicialização.
    Log.Fatal(ex, "A aplicação falhou ao iniciar.");
}
finally
{
    // Garante que todos os logs sejam gravados antes de a aplicação fechar.
    Log.CloseAndFlush();
}

static bool FixedTimeEquals(string providedToken, string expectedToken)
{
    var providedBytes = Encoding.UTF8.GetBytes(providedToken);
    var expectedBytes = Encoding.UTF8.GetBytes(expectedToken);

    return providedBytes.Length == expectedBytes.Length &&
           CryptographicOperations.FixedTimeEquals(providedBytes, expectedBytes);
}

static object CreateHealthResponse(string status)
{
    return new
    {
        status,
        service = "Salgadin API",
        timestamp = DateTimeOffset.UtcNow
    };
}

static object CreateReadinessResponse(string status, string database)
{
    return new
    {
        status,
        service = "Salgadin API",
        database,
        timestamp = DateTimeOffset.UtcNow
    };
}
