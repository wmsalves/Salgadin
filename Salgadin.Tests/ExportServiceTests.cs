using Microsoft.EntityFrameworkCore;
using Salgadin.Data;
using Salgadin.Models;
using Salgadin.Repositories;
using Salgadin.Services;
using System.Text;
using Xunit;

namespace Salgadin.Tests;

public class ExportServiceTests
{
    [Fact]
    public async Task ExportIncomesAsync_ReturnsCsvOnlyForAuthenticatedUser()
    {
        await using var context = CreateContext();
        context.Incomes.AddRange(
            CreateIncome(1, 1, "Salario", 2600m, new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc), true),
            CreateIncome(2, 2, "Freelance", 500m, new DateTime(2026, 5, 2, 0, 0, 0, DateTimeKind.Utc), false));
        await context.SaveChangesAsync();

        using var unitOfWork = new UnitOfWork(context);
        var service = new ExportService(unitOfWork, new FakeUserContextService());

        var result = await service.ExportIncomesAsync(null, null);
        var csv = Encoding.UTF8.GetString(result.Content);

        Assert.Equal("text/csv", result.ContentType);
        Assert.Contains("Data,Descricao,Tipo,Valor", csv);
        Assert.Contains("Salario", csv);
        Assert.DoesNotContain("Freelance", csv);
        Assert.Contains("Renda fixa", csv);
    }

    [Fact]
    public async Task ExportIncomesAsync_AppliesInclusiveDateRange()
    {
        await using var context = CreateContext();
        context.Incomes.AddRange(
            CreateIncome(1, 1, "Salario", 2600m, new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc), true),
            CreateIncome(2, 1, "Bonus", 350m, new DateTime(2026, 5, 2, 12, 0, 0, DateTimeKind.Utc), false),
            CreateIncome(3, 1, "Extra", 200m, new DateTime(2026, 5, 3, 0, 0, 0, DateTimeKind.Utc), false));
        await context.SaveChangesAsync();

        using var unitOfWork = new UnitOfWork(context);
        var service = new ExportService(unitOfWork, new FakeUserContextService());

        var result = await service.ExportIncomesAsync(
            new DateTime(2026, 5, 1),
            new DateTime(2026, 5, 2));
        var csv = Encoding.UTF8.GetString(result.Content);

        Assert.Contains("Salario", csv);
        Assert.Contains("Bonus", csv);
        Assert.DoesNotContain("Extra", csv);
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SalgadinContext(options);
    }

    private static Income CreateIncome(
        int id,
        int userId,
        string description,
        decimal amount,
        DateTime date,
        bool isFixed)
    {
        return new Income
        {
            Id = id,
            UserId = userId,
            Description = description,
            Amount = amount,
            Date = date,
            IsFixed = isFixed
        };
    }

    private sealed class FakeUserContextService : IUserContextService
    {
        public int GetUserId() => 1;
    }
}
