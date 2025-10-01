using Microsoft.AspNetCore.WebUtilities;
using Salgadin.Exceptions;
using System.Net;
using System.Text.Json;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    public ErrorHandlingMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        // Captura exceções de autorização/autenticação.
        catch (UnauthorizedAccessException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.Unauthorized, ex.Message);
        }
        // Captura exceções de recurso não encontrado.
        catch (NotFoundException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.NotFound, ex.Message);
        }
        // Captura exceções de dados de entrada inválidos.
        catch (BadInputException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.BadRequest, ex.Message);
        }
        // Captura todas as outras exceções não tratadas como um erro interno do servidor.
        catch (Exception ex)
        {
            // TODO: Logar a exceção 'ex' em um sistema de logging para depuração.
            await WriteProblem(context, (int)HttpStatusCode.InternalServerError, "Ocorreu um erro inesperado.");
        }
    }

    // Gera uma resposta de erro padronizada no formato 'application/problem+json'.
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