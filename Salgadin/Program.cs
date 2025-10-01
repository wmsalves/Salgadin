using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Salgadin.Data;
using Salgadin.Mappings;
using Salgadin.Repositories;
using Salgadin.Services;
using Salgadin.Validators;
using Serilog;
using System.Text;

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

    // Configura o Entity Framework Core para usar o SQL Server.
    builder.Services.AddDbContext<SalgadinContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Registra os perfis de mapeamento do AutoMapper.
    builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

    // Registra a Unit of Work com um tempo de vida "scoped".
    builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

    // Registra os serviços da aplicação.
    builder.Services.AddScoped<IExpenseService, ExpenseService>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IUserContextService, UserContextService>();

    // Permite o acesso ao HttpContext nos serviços.
    builder.Services.AddHttpContextAccessor();

    // Registra os validadores do FluentValidation.
    builder.Services.AddValidatorsFromAssemblyContaining<UserRegisterDtoValidator>();
    // Habilita a validação automática via FluentValidation.
    builder.Services.AddFluentValidationAutoValidation();

    // Adiciona os serviços dos controllers da API.
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    // Configura a autenticação via JWT Bearer Token.
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

    // Define uma política de CORS para permitir requisições do frontend.
    var corsPolicy = "_salgadinCors";
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(corsPolicy, policy =>
        {
            policy
                .WithOrigins("http://localhost:5173", "http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
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

    app.UseHttpsRedirection();

    // Aplica a política de CORS.
    app.UseCors(corsPolicy);

    app.UseAuthentication();
    app.UseAuthorization();

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