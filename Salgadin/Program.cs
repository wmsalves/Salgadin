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
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ----- Services -----

// Configura o Entity Framework Core para usar o SQL Server.
// A string de conex�o � lida do arquivo de configura��o (appsettings.json).
builder.Services.AddDbContext<SalgadinContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registra os perfis de mapeamento do AutoMapper.
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Registra a Unit of Work com um tempo de vida "scoped".
// Uma inst�ncia ser� criada por requisi��o HTTP.
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>(); // CORRIGIDO

// Registra os servi�os da aplica��o, que agora dependem da IUnitOfWork.
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserContextService, UserContextService>();

// Adiciona o IHttpContextAccessor para permitir o acesso ao HttpContext nos servi�os (ex: UserContextService).
builder.Services.AddHttpContextAccessor();

// Registra todos os validadores do assembly especificado na inje��o de depend�ncia.
builder.Services.AddValidatorsFromAssemblyContaining<UserRegisterDtoValidator>();
builder.Services.AddFluentValidationAutoValidation();


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

// Define uma pol�tica de CORS para permitir requisi��es do frontend em desenvolvimento.
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

// Configura o Swagger para documenta��o da API e adiciona suporte para autentica��o JWT na UI.
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

// Adiciona o middleware global para tratamento de erros.
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CAplica a pol�tica de CORS definida anteriormente.
app.UseCors(corsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();