using Microsoft.EntityFrameworkCore;
using Salgadin.Data;
using Salgadin.Models;
using Salgadin.Repositories;
using Salgadin.Services;
using Xunit;

namespace Salgadin.Tests;

public class CalendarServiceTests
{
    [Fact]
    public async Task GetMonthAsync_ReturnsConcreteAndPredictedMonthlyTotals()
    {
        await using var context = CreateContext();
        SeedBaseData(context);
        context.Incomes.Add(new Income
        {
            Id = 1,
            UserId = 1,
            Description = "Freela",
            Amount = 500m,
            Date = new DateTime(2026, 6, 3, 0, 0, 0, DateTimeKind.Utc)
        });
        context.Expenses.Add(new Expense
        {
            Id = 1,
            UserId = 1,
            Description = "Mercado",
            Amount = 120m,
            CategoryId = 1,
            Date = new DateTime(2026, 6, 5, 0, 0, 0, DateTimeKind.Utc)
        });
        context.RecurringSchedules.AddRange(
            CreateSchedule(1, RecurringScheduleType.Income, "Salario", 4200m, 1, null),
            CreateSchedule(2, RecurringScheduleType.Expense, "Internet", 100m, 10, 1));
        await context.SaveChangesAsync();

        var service = CreateService(context);

        var result = await service.GetMonthAsync(2026, 6);

        Assert.Equal(4700m, result.PredictedIncome);
        Assert.Equal(220m, result.PredictedExpense);
        Assert.Equal(4480m, result.PredictedBalance);

        var firstDay = result.Days.Single(item => item.Date.Day == 1);
        Assert.Equal(4200m, firstDay.IncomeTotal);
        Assert.Contains(firstDay.Recurrences, item => item.Description == "Salario" && item.Status == "Predicted");

        var tenthDay = result.Days.Single(item => item.Date.Day == 10);
        Assert.Equal(100m, tenthDay.ExpenseTotal);
        Assert.Contains(tenthDay.Recurrences, item => item.Description == "Internet" && item.Status == "Predicted");
    }

    [Fact]
    public async Task GetMonthAsync_DoesNotDoubleCountRegisteredRecurringOccurrence()
    {
        await using var context = CreateContext();
        SeedBaseData(context);
        context.RecurringSchedules.Add(CreateSchedule(2, RecurringScheduleType.Expense, "Internet", 100m, 10, 1));
        context.Expenses.Add(new Expense
        {
            Id = 10,
            UserId = 1,
            Description = "Internet",
            Amount = 100m,
            CategoryId = 1,
            Date = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc),
            RecurringScheduleId = 2,
            RecurringPeriodYear = 2026,
            RecurringPeriodMonth = 6
        });
        await context.SaveChangesAsync();

        var service = CreateService(context);

        var result = await service.GetMonthAsync(2026, 6);

        Assert.Equal(100m, result.PredictedExpense);

        var tenthDay = result.Days.Single(item => item.Date.Day == 10);
        Assert.Equal(100m, tenthDay.ExpenseTotal);
        Assert.Contains(tenthDay.Recurrences, item => item.Description == "Internet" && item.Status == "Registered");
    }

    [Fact]
    public async Task GetMonthAsync_UsesLastMonthDayForDay31RecurringSchedule()
    {
        await using var context = CreateContext();
        SeedBaseData(context);
        context.RecurringSchedules.Add(CreateSchedule(3, RecurringScheduleType.Expense, "Seguro", 80m, 31, 1));
        await context.SaveChangesAsync();

        var service = CreateService(context);

        var result = await service.GetMonthAsync(2026, 2);

        var lastDay = result.Days.Single(item => item.Date.Day == 28);
        Assert.Equal(80m, lastDay.ExpenseTotal);
        Assert.Contains(lastDay.Recurrences, item => item.Description == "Seguro");
    }

    private static RecurringSchedule CreateSchedule(
        int id,
        RecurringScheduleType type,
        string description,
        decimal amount,
        int dayOfMonth,
        int? categoryId)
    {
        return new RecurringSchedule
        {
            Id = id,
            UserId = 1,
            Type = type,
            Description = description,
            Amount = amount,
            CategoryId = categoryId,
            Frequency = RecurringScheduleFrequency.Monthly,
            StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            DayOfMonth = dayOfMonth,
            NextOccurrenceDate = new DateTime(2026, 1, Math.Min(dayOfMonth, 31), 0, 0, 0, DateTimeKind.Utc),
            Status = RecurringScheduleStatus.Active,
            Source = RecurringScheduleSource.Manual,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static CalendarService CreateService(SalgadinContext context)
    {
        return new CalendarService(new UnitOfWork(context), new FakeUserContextService());
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SalgadinContext(options);
    }

    private static void SeedBaseData(SalgadinContext context)
    {
        context.Users.Add(new User
        {
            Id = 1,
            Name = "Usuario 1",
            Username = "user1@example.com",
            PasswordHash = [1],
            PasswordSalt = [1]
        });

        context.Categories.Add(new Category
        {
            Id = 1,
            Name = "Contas",
            UserId = 1
        });

        context.SaveChanges();
    }

    private sealed class FakeUserContextService : IUserContextService
    {
        public int GetUserId() => 1;
    }
}
