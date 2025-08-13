using Microsoft.AspNetCore.WebUtilities;
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
        catch (UnauthorizedAccessException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.Unauthorized, ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.NotFound, ex.Message);
        }
        catch (Exception ex)
        {
            await WriteProblem(context, (int)HttpStatusCode.InternalServerError, ex.Message);
        }
    }

    private static async Task WriteProblem(HttpContext ctx, int status, string detail)
    {
        ctx.Response.ContentType = "application/problem+json";
        ctx.Response.StatusCode = status;

        var problem = new
        {
            type = "about:blank",
            title = ReasonPhrases.GetReasonPhrase(status),
            status,
            detail,
            traceId = ctx.TraceIdentifier
        };

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
