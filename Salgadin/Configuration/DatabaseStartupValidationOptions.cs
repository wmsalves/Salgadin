namespace Salgadin.Configuration;

public sealed class DatabaseStartupValidationOptions
{
    public bool ValidateSchemaOnStartup { get; init; }
    public bool FailOnPendingMigrations { get; init; }
    public bool ApplyMigrationsOnStartup { get; init; }

    public static DatabaseStartupValidationOptions FromConfiguration(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var validateSchemaOnStartup = configuration.GetValue<bool?>("Database:ValidateSchemaOnStartup");
        var failOnPendingMigrations = configuration.GetValue<bool?>("Database:FailOnPendingMigrations");
        var applyMigrationsOnStartup = configuration.GetValue<bool?>("Database:ApplyMigrationsOnStartup");

        return new DatabaseStartupValidationOptions
        {
            ValidateSchemaOnStartup = validateSchemaOnStartup ?? environment.IsProduction(),
            FailOnPendingMigrations = failOnPendingMigrations ?? environment.IsProduction(),
            ApplyMigrationsOnStartup = applyMigrationsOnStartup ?? false
        };
    }
}
