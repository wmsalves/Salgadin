using Microsoft.EntityFrameworkCore;
using Salgadin.Data;

namespace Salgadin.Configuration;

public static class DatabaseStartupValidator
{
    public static async Task ValidateAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var services = scope.ServiceProvider;
        var configuration = services.GetRequiredService<IConfiguration>();
        var environment = services.GetRequiredService<IWebHostEnvironment>();
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("DatabaseStartupValidator");
        var options = DatabaseStartupValidationOptions.FromConfiguration(configuration, environment);

        if (!options.ValidateSchemaOnStartup)
        {
            logger.LogInformation("Database startup validation is disabled for environment {EnvironmentName}.", environment.EnvironmentName);
            return;
        }

        var dbContext = services.GetRequiredService<SalgadinContext>();

        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync();
            if (!canConnect)
            {
                logger.LogCritical("Database startup validation failed because the PostgreSQL database is unreachable.");
                throw new InvalidOperationException("Unable to connect to the configured PostgreSQL database.");
            }

            var pendingMigrations = (await dbContext.Database.GetPendingMigrationsAsync()).ToArray();

            if (pendingMigrations.Length > 0 && options.FailOnPendingMigrations)
            {
                logger.LogCritical(
                    "Database startup validation failed because pending EF Core migrations were detected: {PendingMigrations}.",
                    string.Join(", ", pendingMigrations));
                throw new InvalidOperationException(
                    $"Database schema is not up to date. Pending EF Core migrations: {string.Join(", ", pendingMigrations)}. Apply migrations before starting the API.");
            }

            logger.LogInformation(
                "Database startup validation succeeded. CanConnect={CanConnect}; PendingMigrations={PendingMigrationCount}.",
                canConnect,
                pendingMigrations.Length);
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Database startup validation failed due to an unexpected error.");
            throw;
        }
    }
}
