using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Salgadin.Configuration;

namespace Salgadin.Data;

public sealed class SalgadinContextFactory : IDesignTimeDbContextFactory<SalgadinContext>
{
    public SalgadinContext CreateDbContext(string[] args)
    {
        var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
        var basePath = ResolveBasePath();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environmentName}.json", optional: true)
            .AddUserSecrets<SalgadinContextFactory>(optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = DatabaseConnectionString.Resolve(configuration);
        var optionsBuilder = new DbContextOptionsBuilder<SalgadinContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new SalgadinContext(optionsBuilder.Options);
    }

    private static string ResolveBasePath()
    {
        var currentDirectory = Directory.GetCurrentDirectory();
        var projectPath = Path.Combine(currentDirectory, "Salgadin");

        return File.Exists(Path.Combine(currentDirectory, "appsettings.json"))
            ? currentDirectory
            : projectPath;
    }
}
