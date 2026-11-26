using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Salgadin.Data;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Mappings;
using Salgadin.Models;
using Salgadin.Repositories;
using Salgadin.Services;
using Xunit;

namespace Salgadin.Tests;

public class QuickExpenseServiceTests
{
    private static readonly DateTime Today = new(2026, 11, 26, 0, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task CreateFromText_ParsesAmountDescriptionAndKeywordCategory()
    {
        await using var context = CreateContext();
        Seed(context);
        var service = CreateService(context);

        var created = await service.CreateFromTextAsync(new QuickExpenseRequestDto { Text = "café 7,50", Today = Today });

        Assert.Equal(7.50m, created.Amount);
        Assert.Equal("Café", created.Description);
        Assert.Equal(1, created.CategoryId);
        Assert.Equal(Today, created.Date);
        Assert.Equal(DateTimeKind.Utc, created.Date.Kind);
    }

    [Fact]
    public async Task CreateFromText_UnderstandsOntem()
    {
        await using var context = CreateContext();
        Seed(context);
        var service = CreateService(context);

        var created = await service.CreateFromTextAsync(new QuickExpenseRequestDto { Text = "uber 23,40 ontem", Today = Today });

        Assert.Equal(Today.AddDays(-1), created.Date);
        Assert.Equal("Uber", created.Description);
        Assert.Equal(2, created.CategoryId);
    }

    [Fact]
    public async Task CreateFromText_PrefersCategoryFromUserHistory()
    {
        await using var context = CreateContext();
        Seed(context);
        // "coxinha" nao tem palavra-chave; o usuario ja lancou em Alimentacao antes.
        context.Expenses.Add(new Expense
        {
            Id = 10, UserId = 1, CategoryId = 1, Description = "Coxinha", Amount = 8m,
            Date = Today.AddDays(-3),
        });
        await context.SaveChangesAsync();
        var service = CreateService(context);

        var created = await service.CreateFromTextAsync(new QuickExpenseRequestDto { Text = "coxinha 9", Today = Today });

        Assert.Equal(1, created.CategoryId);
    }

    [Fact]
    public async Task CreateFromText_FallsBackToOutros()
    {
        await using var context = CreateContext();
        Seed(context);
        var service = CreateService(context);

        var created = await service.CreateFromTextAsync(new QuickExpenseRequestDto { Text = "presente 40", Today = Today });

        Assert.Equal(3, created.CategoryId);
    }

    [Fact]
    public async Task CreateFromText_RejectsTextWithoutAmount()
    {
        await using var context = CreateContext();
        Seed(context);
        var service = CreateService(context);

        await Assert.ThrowsAsync<BadInputException>(() =>
            service.CreateFromTextAsync(new QuickExpenseRequestDto { Text = "café", Today = Today }));
        Assert.Empty(context.Expenses);
    }

    [Fact]
    public async Task CreateFromText_NeverUsesAnotherUsersHistory()
    {
        await using var context = CreateContext();
        Seed(context);
        context.Users.Add(new User { Id = 2, Name = "Outra", Username = "outra@example.com", PasswordHash = [1], PasswordSalt = [1] });
        context.Categories.Add(new Category { Id = 20, Name = "Lazer", UserId = 2 });
        context.Expenses.Add(new Expense { Id = 30, UserId = 2, CategoryId = 20, Description = "Presente", Amount = 40m, Date = Today });
        await context.SaveChangesAsync();
        var service = CreateService(context);

        var created = await service.CreateFromTextAsync(new QuickExpenseRequestDto { Text = "presente 40", Today = Today });

        Assert.Equal(3, created.CategoryId);
    }

    [Fact]
    public async Task GetFrequent_ReturnsRepeatedNonRecurringExpensesOfCurrentUser()
    {
        await using var context = CreateContext();
        Seed(context);
        var now = DateTime.UtcNow.Date;
        context.Expenses.AddRange(
            new Expense { Id = 1, UserId = 1, CategoryId = 1, Description = "Café", Amount = 7m, Date = DateTime.SpecifyKind(now.AddDays(-5), DateTimeKind.Utc) },
            new Expense { Id = 2, UserId = 1, CategoryId = 1, Description = "cafe", Amount = 7.5m, Date = DateTime.SpecifyKind(now.AddDays(-1), DateTimeKind.Utc) },
            new Expense { Id = 3, UserId = 1, CategoryId = 2, Description = "Uber", Amount = 20m, Date = DateTime.SpecifyKind(now.AddDays(-2), DateTimeKind.Utc) },
            new Expense { Id = 4, UserId = 1, CategoryId = 3, Description = "Aluguel", Amount = 1450m, Date = DateTime.SpecifyKind(now.AddDays(-2), DateTimeKind.Utc), RecurringScheduleId = 99 },
            new Expense { Id = 5, UserId = 1, CategoryId = 3, Description = "Aluguel", Amount = 1450m, Date = DateTime.SpecifyKind(now.AddDays(-32), DateTimeKind.Utc), RecurringScheduleId = 99 });
        await context.SaveChangesAsync();
        var service = CreateService(context);

        var frequent = await service.GetFrequentAsync(6);

        var item = Assert.Single(frequent);
        Assert.Equal("cafe", item.Description);
        Assert.Equal(7.5m, item.Amount);
        Assert.Equal(2, item.Count);
    }

    private static QuickExpenseService CreateService(SalgadinContext context)
    {
        var unitOfWork = new UnitOfWork(context);
        var mapper = new MapperConfiguration(
                cfg => cfg.AddProfile<AutoMapperProfile>(),
                NullLoggerFactory.Instance)
            .CreateMapper();
        var userContext = new FakeUserContextService();
        var expenseService = new ExpenseService(unitOfWork, mapper, userContext, new FakeNotificationService());
        return new QuickExpenseService(unitOfWork, userContext, new WhatsAppExpenseMessageParser(), expenseService);
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new SalgadinContext(options);
    }

    private static void Seed(SalgadinContext context)
    {
        context.Users.Add(new User { Id = 1, Name = "Teste", Username = "teste@example.com", PasswordHash = [1], PasswordSalt = [1] });
        context.Categories.AddRange(
            new Category { Id = 1, Name = "Alimentação", UserId = 1 },
            new Category { Id = 2, Name = "Transporte", UserId = 1 },
            new Category { Id = 3, Name = "Outros", UserId = 1 });
        context.SaveChanges();
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
