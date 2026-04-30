using Npgsql;

namespace Salgadin.Configuration;

public static class DatabaseConnectionString
{
    private static readonly string[] SupabaseConnectionKeys =
    [
        "Supabase:DbConnection",
        "SUPABASE_DB_CONNECTION",
        "SUPABASE_DATABASE_URL",
        "SUPABASE_CONNECTION_STRING",
        "DATABASE_URL",
        "POSTGRES_URL"
    ];

    public static string Resolve(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = SupabaseConnectionKeys
                .Select(key => configuration[key])
                .FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Database connection is not configured. Set SUPABASE_DB_CONNECTION or ConnectionStrings:DefaultConnection.");
        }

        return NormalizePostgresUrl(connectionString);
    }

    private static string NormalizePostgresUrl(string connectionString)
    {
        var trimmedConnectionString = connectionString.Trim();

        if (!Uri.TryCreate(trimmedConnectionString, UriKind.Absolute, out var uri) ||
            (uri.Scheme != "postgres" && uri.Scheme != "postgresql"))
        {
            return trimmedConnectionString;
        }

        var database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
        var credentials = uri.UserInfo.Split(':', 2);

        if (string.IsNullOrWhiteSpace(uri.Host) ||
            string.IsNullOrWhiteSpace(database) ||
            credentials.Length < 2 ||
            string.IsNullOrWhiteSpace(credentials[0]) ||
            string.IsNullOrWhiteSpace(credentials[1]))
        {
            throw new InvalidOperationException(
                "PostgreSQL connection URL must include host, database, username, and password.");
        }

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = database,
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = Uri.UnescapeDataString(credentials[1]),
            SslMode = SslMode.Require
        };

        foreach (var (key, value) in ParseQuery(uri.Query))
        {
            if (key.Equals("sslmode", StringComparison.OrdinalIgnoreCase) &&
                Enum.TryParse<SslMode>(value, ignoreCase: true, out var sslMode))
            {
                builder.SslMode = sslMode;
            }
        }

        return builder.ConnectionString;
    }

    private static IEnumerable<(string Key, string Value)> ParseQuery(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            yield break;
        }

        foreach (var pair in query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = pair.Split('=', 2);
            var key = Uri.UnescapeDataString(parts[0]);
            var value = parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : string.Empty;

            if (!string.IsNullOrWhiteSpace(key))
            {
                yield return (key, value);
            }
        }
    }
}
