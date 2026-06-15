using Microsoft.EntityFrameworkCore;
using Salgadin.Data;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;
using Salgadin.Services;
using Xunit;

namespace Salgadin.Tests;

public class RecurringScheduleServiceTests
{
    [Fact]
    public async Task CreateAsync_CreatesMonthlyExpenseSchedule()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);

        var created = await service.CreateAsync(new CreateRecurringScheduleDto
        {
            Type = "Expense",
            Description = "Internet",
            Amount = 120m,
            CategoryId = 1,
            Frequency = "Monthly",
            StartDate = new DateTime(2026, 2, 10),
            DayOfMonth = 10
        });

        Assert.Equal("Expense", created.Type);
        Assert.Equal("Active", created.Status);
        Assert.Equal(new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc), created.NextOccurrenceDate);
    }

    [Fact]
    public async Task CreateAsync_CreatesMonthlyIncomeSchedule()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);

        var created = await service.CreateAsync(new CreateRecurringScheduleDto
        {
            Type = "Income",
            Description = "Salario",
            Amount = 4200m,
            Frequency = "Monthly",
            StartDate = new DateTime(2026, 2, 1),
            DayOfMonth = 1
        });

        Assert.Equal("Income", created.Type);
        Assert.Null(created.CategoryId);
    }

    [Fact]
    public async Task CreateAsync_RejectsExpenseWithoutCategory()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);

        await Assert.ThrowsAsync<BadInputException>(() =>
            service.CreateAsync(new CreateRecurringScheduleDto
            {
                Type = "Expense",
                Description = "Streaming",
                Amount = 39m,
                StartDate = new DateTime(2026, 2, 1),
                DayOfMonth = 1
            }));
    }

    [Fact]
    public async Task CreateAsync_RejectsCategoryFromAnotherUser()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);

        await Assert.ThrowsAsync<BadInputException>(() =>
            service.CreateAsync(new CreateRecurringScheduleDto
            {
                Type = "Expense",
                Description = "Academia",
                Amount = 99m,
                CategoryId = 2,
                StartDate = new DateTime(2026, 2, 1),
                DayOfMonth = 1
            }));
    }

    [Fact]
    public async Task GenerateDueAsync_CreatesExpenseOccurrence()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);
        await CreateExpenseSchedule(service);

        var result = await service.GenerateDueAsync(1, new DateTime(2026, 2, 28));

        var expense = await context.Expenses.SingleAsync();
        Assert.Equal(1, result.GeneratedExpenses);
        Assert.Equal(120m, expense.Amount);
        Assert.Equal(2026, expense.RecurringPeriodYear);
        Assert.Equal(2, expense.RecurringPeriodMonth);
    }

    [Fact]
    public async Task GenerateDueAsync_CreatesIncomeOccurrence()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);
        await service.CreateAsync(new CreateRecurringScheduleDto
        {
            Type = "Income",
            Description = "Salario",
            Amount = 4200m,
            StartDate = new DateTime(2026, 2, 1),
            DayOfMonth = 1
        });

        var result = await service.GenerateDueAsync(1, new DateTime(2026, 2, 28));

        var income = await context.Incomes.SingleAsync();
        Assert.Equal(1, result.GeneratedIncomes);
        Assert.Equal(4200m, income.Amount);
        Assert.Equal(2026, income.RecurringPeriodYear);
        Assert.Equal(2, income.RecurringPeriodMonth);
    }

    [Fact]
    public async Task GenerateDueAsync_DoesNotDuplicateSameMonth()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);
        await CreateExpenseSchedule(service);

        await service.GenerateDueAsync(1, new DateTime(2026, 2, 28));
        var second = await service.GenerateDueAsync(1, new DateTime(2026, 2, 28));

        Assert.Equal(1, await context.Expenses.CountAsync());
        Assert.Equal(0, second.GeneratedExpenses);
    }

    [Fact]
    public async Task GenerateDueAsync_UsesLastDayForShortMonth()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);
        await service.CreateAsync(new CreateRecurringScheduleDto
        {
            Type = "Expense",
            Description = "Aluguel",
            Amount = 1800m,
            CategoryId = 1,
            StartDate = new DateTime(2026, 1, 31),
            DayOfMonth = 31
        });

        await service.GenerateDueAsync(1, new DateTime(2026, 2, 28));

        var expenses = await context.Expenses.OrderBy(item => item.Date).ToListAsync();
        Assert.Collection(
            expenses,
            item => Assert.Equal(new DateTime(2026, 1, 31, 0, 0, 0, DateTimeKind.Utc), item.Date),
            item => Assert.Equal(new DateTime(2026, 2, 28, 0, 0, 0, DateTimeKind.Utc), item.Date));
    }

    [Fact]
    public async Task GenerateDueAsync_DoesNotGeneratePausedSchedule()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);
        var schedule = await CreateExpenseSchedule(service);
        await service.PauseAsync(schedule.Id);

        var result = await service.GenerateDueAsync(1, new DateTime(2026, 2, 28));

        Assert.Equal(0, result.GeneratedExpenses);
        Assert.Empty(context.Expenses);
    }

    [Fact]
    public async Task GenerateDueAsync_FinishesAfterEndDate()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var service = CreateService(context);
        await service.CreateAsync(new CreateRecurringScheduleDto
        {
            Type = "Expense",
            Description = "Seguro",
            Amount = 80m,
            CategoryId = 1,
            StartDate = new DateTime(2026, 2, 10),
            EndDate = new DateTime(2026, 2, 10),
            DayOfMonth = 10
        });

        await service.GenerateDueAsync(1, new DateTime(2026, 3, 10));

        var schedule = await context.RecurringSchedules.SingleAsync();
        Assert.Equal(RecurringScheduleStatus.Finished, schedule.Status);
        Assert.Single(context.Expenses);
    }

    [Fact]
    public async Task GetByIdAsync_DoesNotReturnAnotherUsersSchedule()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        context.RecurringSchedules.Add(new RecurringSchedule
        {
            Id = 99,
            UserId = 2,
            Type = RecurringScheduleType.Income,
            Description = "Outro usuario",
            Amount = 100m,
            Frequency = RecurringScheduleFrequency.Monthly,
            StartDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
            DayOfMonth = 1,
            NextOccurrenceDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
            Status = RecurringScheduleStatus.Active,
            Source = RecurringScheduleSource.Manual,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var service = CreateService(context);

        Assert.Null(await service.GetByIdAsync(99));
    }

    [Fact]
    public async Task GetSummaryAsync_ReturnsOperationalCounts()
    {
        await using var context = CreateContext();
        SeedUsersAndCategories(context);
        var today = DateTime.UtcNow.Date;
        context.RecurringSchedules.AddRange(
            CreateSchedule(1, RecurringScheduleStatus.Active, today.AddDays(-1), today.AddDays(-1)),
            CreateSchedule(2, RecurringScheduleStatus.Active, today.AddDays(5), today.AddDays(-30)),
            CreateSchedule(3, RecurringScheduleStatus.Paused, today.AddDays(3), null));
        await context.SaveChangesAsync();

        var service = CreateService(context);

        var summary = await service.GetSummaryAsync();

        Assert.Equal(3, summary.Total);
        Assert.Equal(2, summary.Active);
        Assert.Equal(1, summary.Paused);
        Assert.Equal(1, summary.Due);
        Assert.Equal(today.AddDays(-1), summary.NextOccurrenceDate);
        Assert.Equal(today.AddDays(-1), summary.LastGenerationDate);
    }

    private static async Task<RecurringScheduleDto> CreateExpenseSchedule(RecurringScheduleService service)
    {
        return await service.CreateAsync(new CreateRecurringScheduleDto
        {
            Type = "Expense",
            Description = "Internet",
            Amount = 120m,
            CategoryId = 1,
            StartDate = new DateTime(2026, 2, 10),
            DayOfMonth = 10
        });
    }

    private static RecurringSchedule CreateSchedule(
        int id,
        RecurringScheduleStatus status,
        DateTime nextOccurrenceDate,
        DateTime? lastGeneratedOccurrenceDate)
    {
        return new RecurringSchedule
        {
            Id = id,
            UserId = 1,
            Type = RecurringScheduleType.Expense,
            Description = $"Recorrencia {id}",
            Amount = 100m,
            CategoryId = 1,
            Frequency = RecurringScheduleFrequency.Monthly,
            StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            DayOfMonth = 1,
            NextOccurrenceDate = DateTime.SpecifyKind(nextOccurrenceDate, DateTimeKind.Utc),
            LastGeneratedOccurrenceDate = lastGeneratedOccurrenceDate.HasValue
                ? DateTime.SpecifyKind(lastGeneratedOccurrenceDate.Value, DateTimeKind.Utc)
                : null,
            Status = status,
            Source = RecurringScheduleSource.Manual,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static RecurringScheduleService CreateService(SalgadinContext context)
    {
        return new RecurringScheduleService(
            new UnitOfWork(context),
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

    private static void SeedUsersAndCategories(SalgadinContext context)
    {
        context.Users.AddRange(
            new User
            {
                Id = 1,
                Name = "Usuario 1",
                Username = "user1@example.com",
                PasswordHash = [1],
                PasswordSalt = [1]
            },
            new User
            {
                Id = 2,
                Name = "Usuario 2",
                Username = "user2@example.com",
                PasswordHash = [1],
                PasswordSalt = [1]
            });

        context.Categories.AddRange(
            new Category
            {
                Id = 1,
                Name = "Assinaturas",
                UserId = 1
            },
            new Category
            {
                Id = 2,
                Name = "Outro usuario",
                UserId = 2
            });

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
