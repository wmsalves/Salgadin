namespace Salgadin.Configuration;

public sealed class DatabaseStartupValidationOptions
{
    public bool ValidateSchemaOnStartup { get; init; }
    public bool FailOnPendingMigrations { get; init; }

    public static DatabaseStartupValidationOptions FromConfiguration(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var validateSchemaOnStartup = configuration.GetValue<bool?>("Database:ValidateSchemaOnStartup");
        var failOnPendingMigrations = configuration.GetValue<bool?>("Database:FailOnPendingMigrations");

        return new DatabaseStartupValidationOptions
        {
            ValidateSchemaOnStartup = validateSchemaOnStartup ?? environment.IsProduction(),
            FailOnPendingMigrations = failOnPendingMigrations ?? environment.IsProduction()
        };
    }
}
