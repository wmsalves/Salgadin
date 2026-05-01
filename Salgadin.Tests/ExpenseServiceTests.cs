using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Salgadin.Data;
using Salgadin.DTOs;
using Salgadin.Mappings;
using Salgadin.Models;
using Salgadin.Repositories;
using Salgadin.Services;
using Xunit;

namespace Salgadin.Tests;

public class ExpenseServiceTests
{
    [Fact]
    public async Task GetDailySummaryAsync_AcceptsUnspecifiedDates_AndFiltersByUtcRange()
    {
        await using var context = CreateContext();
        SeedCategory(context);
        context.Expenses.AddRange(
            CreateExpense(1, 1, 10m, new DateTime(2026, 5, 1, 12, 0, 0, DateTimeKind.Utc)),
            CreateExpense(2, 1, 20m, new DateTime(2026, 5, 2, 8, 30, 0, DateTimeKind.Utc)),
            CreateExpense(3, 1, 30m, new DateTime(2026, 5, 3, 0, 0, 0, DateTimeKind.Utc)));
        await context.SaveChangesAsync();

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        var result = (await service.GetDailySummaryAsync(
            new DateTime(2026, 5, 1),
            new DateTime(2026, 5, 2)))
            .OrderBy(item => item.Date)
            .ToList();

        Assert.Collection(
            result,
            day =>
            {
                Assert.Equal(new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc), day.Date);
                Assert.Equal(10m, day.Total);
            },
            day =>
            {
                Assert.Equal(new DateTime(2026, 5, 2, 0, 0, 0, DateTimeKind.Utc), day.Date);
                Assert.Equal(20m, day.Total);
            });
    }

    [Fact]
    public async Task GetPagedAsync_AcceptsUnspecifiedDates_AndUsesExclusiveEndBoundary()
    {
        await using var context = CreateContext();
        SeedCategory(context);
        context.Expenses.AddRange(
            CreateExpense(1, 1, 10m, new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc)),
            CreateExpense(2, 1, 20m, new DateTime(2026, 5, 2, 23, 59, 59, DateTimeKind.Utc)),
            CreateExpense(3, 1, 30m, new DateTime(2026, 5, 3, 0, 0, 0, DateTimeKind.Utc)));
        await context.SaveChangesAsync();

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        var result = await service.GetPagedAsync(
            1,
            10,
            new DateTime(2026, 5, 1),
            new DateTime(2026, 5, 2),
            null);

        Assert.Equal(2, result.TotalCount);
        Assert.Equal(2, result.Items.Count());
        Assert.DoesNotContain(result.Items, item => item.Date == new DateTime(2026, 5, 3, 0, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public async Task AddExpenseAsync_NormalizesExpenseDateToUtc()
    {
        await using var context = CreateContext();
        SeedCategory(context);

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        var created = await service.AddExpenseAsync(new CreateExpenseDto
        {
            Description = "Mercado",
            Amount = 59.9m,
            CategoryId = 1,
            Date = new DateTime(2026, 5, 1)
        });

        var saved = await context.Expenses.SingleAsync(e => e.Id == created.Id);

        Assert.Equal(DateTimeKind.Utc, saved.Date.Kind);
        Assert.Equal(new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc), saved.Date);
    }

    private static ExpenseService CreateService(IUnitOfWork unitOfWork)
    {
        var mapper = new MapperConfiguration(
                cfg => cfg.AddProfile<AutoMapperProfile>(),
                NullLoggerFactory.Instance)
            .CreateMapper();

        return new ExpenseService(
            unitOfWork,
            mapper,
            new FakeUserContextService(),
            new FakeNotificationService());
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SalgadinContext(options);
    }

    private static void SeedCategory(SalgadinContext context)
    {
        context.Categories.Add(new Category
        {
            Id = 1,
            Name = "Alimentacao",
            UserId = 1
        });
        context.SaveChanges();
    }

    private static Expense CreateExpense(int id, int categoryId, decimal amount, DateTime date)
    {
        return new Expense
        {
            Id = id,
            Description = $"Expense {id}",
            Amount = amount,
            CategoryId = categoryId,
            UserId = 1,
            Date = date
        };
    }

    private sealed class FakeUserContextService : IUserContextService
    {
        public int GetUserId() => 1;
    }

    private sealed class FakeNotificationService : INotificationService
    {
        public Task<IEnumerable<GoalAlertDto>> GetAlertsAsync(int year, int month) =>
            Task.FromResult<IEnumerable<GoalAlertDto>>([]);

        public Task<IEnumerable<NotificationDto>> GetNotificationsAsync(bool unreadOnly = false) =>
            Task.FromResult<IEnumerable<NotificationDto>>([]);

        public Task<NotificationPreferenceDto> GetPreferencesAsync() =>
            Task.FromResult(new NotificationPreferenceDto());

        public Task<int> MarkAllAsReadAsync() => Task.FromResult(0);

        public Task MarkAsReadAsync(int id) => Task.CompletedTask;

        public Task<NotificationPreferenceDto> UpsertPreferencesAsync(UpdateNotificationPreferenceDto dto) =>
            Task.FromResult(new NotificationPreferenceDto());

        public Task<IEnumerable<NotificationDto>> GenerateGoalNotificationsAsync(DateTime referenceDateUtc) =>
            Task.FromResult<IEnumerable<NotificationDto>>([]);
    }
}
