using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Salgadin.Data;
using Salgadin.Mappings;
using Salgadin.Repositories;
using Salgadin.Services;
using Salgadin.Validators;
using Serilog;
using System.Text;

// Configura um logger inicial para capturar erros durante a inicializa��o.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Iniciando a aplica��o Salgadin.");

    var builder = WebApplication.CreateBuilder(args);

    // Configura o Serilog para ser o provedor de logging principal da aplica��o.
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // ----- Services -----

    // Configura o Entity Framework Core para usar o SQL Server.
    builder.Services.AddDbContext<SalgadinContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Registra os perfis de mapeamento do AutoMapper.
    builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

    // Registra a Unit of Work com um tempo de vida "scoped".
    builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

    // Registra os servi�os da aplica��o.
    builder.Services.AddScoped<IExpenseService, ExpenseService>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();
    builder.Services.AddScoped<ISubcategoryService, SubcategoryService>();
    builder.Services.AddScoped<IReportService, ReportService>();
    builder.Services.AddScoped<IGoalService, GoalService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IUserContextService, UserContextService>();

    // Permite o acesso ao HttpContext nos servi�os.
    builder.Services.AddHttpContextAccessor();

    // Registra os validadores do FluentValidation.
    builder.Services.AddValidatorsFromAssemblyContaining<UserRegisterDtoValidator>();
    // Habilita a valida��o autom�tica via FluentValidation.
    builder.Services.AddFluentValidationAutoValidation();

    // Adiciona os servi�os dos controllers da API.
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        });

    builder.Services.AddEndpointsApiExplorer();

    // Configura a autentica��o via JWT Bearer Token.
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            var key = builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key not configured");
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                ValidateIssuer = false,
                ValidateAudience = false
            };
        });

    // Define uma pol�tica de CORS para permitir requisi��es do frontend.
    var corsPolicy = "_salgadinCors";
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(corsPolicy, policy =>
        {
            policy
                .WithOrigins("http://localhost:5173", "http://localhost:3000")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // Configura o Swagger para documenta��o da API.
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

    // ----- Middleware pipeline -----

    // Adiciona o middleware do Serilog para logar informa��es de cada requisi��o.
    app.UseSerilogRequestLogging();

    // Adiciona o middleware global para tratamento de erros.
    app.UseMiddleware<ErrorHandlingMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    app.UseRouting();

    // Aplica a pol�tica de CORS.
    app.UseCors(corsPolicy);

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    // Captura e loga qualquer erro fatal durante a inicializa��o.
    Log.Fatal(ex, "A aplica��o falhou ao iniciar.");
}
finally
{
    // Garante que todos os logs sejam gravados antes de a aplica��o fechar.
    Log.CloseAndFlush();
}
