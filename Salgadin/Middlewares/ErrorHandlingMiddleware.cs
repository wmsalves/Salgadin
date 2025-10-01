using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging; // Adicionado
using Salgadin.Exceptions;
using System.Net;
using System.Text.Json;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger; // Adicionado

    // Injeta o serviço de logging ILogger via construtor.
    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.Unauthorized, ex.Message);
        }
        catch (NotFoundException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.NotFound, ex.Message);
        }
        catch (BadInputException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            // Loga a exceção completa com nível de erro 'Error'.
            // O Serilog irá enriquecer este log com todos os detalhes da requisição (TraceId, etc.).
            _logger.LogError(ex, "Um erro não tratado ocorreu. TraceId: {TraceId}", context.TraceIdentifier);

            await WriteProblem(context, (int)HttpStatusCode.InternalServerError, "Ocorreu um erro inesperado.");
        }
    }

    private static async Task WriteProblem(HttpContext ctx, int status, string detail)
    {
        ctx.Response.ContentType = "application/problem+json";
        ctx.Response.StatusCode = status;

        var problem = new
        {
            title = ReasonPhrases.GetReasonPhrase(status),
            status,
            detail,
        };

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}