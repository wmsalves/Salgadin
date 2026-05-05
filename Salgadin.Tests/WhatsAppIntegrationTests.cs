using AutoMapper;
using Microsoft.AspNetCore.Http;
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

public class WhatsAppIntegrationTests
{
    [Fact]
    public void Parser_ParsesAdicionarExpenseMessage()
    {
        var parser = new WhatsAppExpenseMessageParser();

        var result = parser.Parse("Adicionar 50 em almoço");

        Assert.True(result.IsSuccess);
        Assert.Equal(50m, result.Amount);
        Assert.Equal("Alimentacao", result.InferredCategoryName);
        Assert.Equal("almoço", result.Description);
        Assert.Equal(DateTimeKind.Utc, result.Date.Kind);
    }

    [Fact]
    public void Parser_ParsesBrazilianDecimalComma()
    {
        var parser = new WhatsAppExpenseMessageParser();

        var result = parser.Parse("Mercado 89,90");

        Assert.True(result.IsSuccess);
        Assert.Equal(89.90m, result.Amount);
        Assert.Equal("Mercado", result.Description);
        Assert.Equal("Alimentacao", result.InferredCategoryName);
    }

    [Fact]
    public void Parser_ReturnsFriendlyError_WhenAmountIsMissing()
    {
        var parser = new WhatsAppExpenseMessageParser();

        var result = parser.Parse("gastei com uber");

        Assert.False(result.IsSuccess);
        Assert.Contains("valor", result.ErrorMessage, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Parser_ReturnsFriendlyError_WhenDescriptionIsMissing()
    {
        var parser = new WhatsAppExpenseMessageParser();

        var result = parser.Parse("Adicionar 50 reais");

        Assert.False(result.IsSuccess);
        Assert.Contains("descricao", result.ErrorMessage, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SimulateIncomingMessage_DoesNotDuplicateProcessedMessage()
    {
        await using var context = CreateContext();
        SeedLinkedUser(context);
        var service = CreateService(context);

        var first = await service.SimulateIncomingMessageAsync(
            "+5531999999999",
            "Adicionar 50 em almoco",
            "test-001");
        var second = await service.SimulateIncomingMessageAsync(
            "+5531999999999",
            "Adicionar 50 em almoco",
            "test-001");

        Assert.True(first.CreatedExpense);
        Assert.True(second.Duplicate);
        Assert.Equal(1, await context.Expenses.CountAsync());
    }

    [Fact]
    public async Task SimulateIncomingMessage_RejectsUnlinkedPhone()
    {
        await using var context = CreateContext();
        SeedUserAndCategory(context);
        var service = CreateService(context);

        var result = await service.SimulateIncomingMessageAsync(
            "+5531888888888",
            "Adicionar 50 em almoco",
            "test-002");

        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
        Assert.Empty(context.Expenses);
    }

    [Fact]
    public async Task SimulateIncomingMessage_CreatesExpenseForLinkedUser()
    {
        await using var context = CreateContext();
        SeedLinkedUser(context);
        var service = CreateService(context);

        var result = await service.SimulateIncomingMessageAsync(
            "+5531999999999",
            "Gastei 25 com Uber",
            "test-003");

        var expense = await context.Expenses.SingleAsync();
        Assert.True(result.CreatedExpense);
        Assert.Equal(25m, expense.Amount);
        Assert.Equal("Uber", expense.Description);
        Assert.Equal(1, expense.UserId);
    }

    private static WhatsAppIntegrationService CreateService(SalgadinContext context)
    {
        var unitOfWork = new UnitOfWork(context);
        var mapper = new MapperConfiguration(
                cfg => cfg.AddProfile<AutoMapperProfile>(),
                NullLoggerFactory.Instance)
            .CreateMapper();
        var expenseService = new ExpenseService(
            unitOfWork,
            mapper,
            new FakeUserContextService(),
            new FakeNotificationService());

        return new WhatsAppIntegrationService(
            context,
            new FakeUserContextService(),
            new WhatsAppExpenseMessageParser(),
            expenseService,
            NullLogger<WhatsAppIntegrationService>.Instance);
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SalgadinContext(options);
    }

    private static void SeedLinkedUser(SalgadinContext context)
    {
        SeedUserAndCategory(context);
        context.UserWhatsAppAccounts.Add(new UserWhatsAppAccount
        {
            Id = 1,
            UserId = 1,
            PhoneNumber = "+5531999999999",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
        context.SaveChanges();
    }

    private static void SeedUserAndCategory(SalgadinContext context)
    {
        context.Users.Add(new User
        {
            Id = 1,
            Name = "Wemerson",
            Username = "wemerson@example.com",
            PhoneNumber = "(31) 99999-9999",
            PasswordHash = [1],
            PasswordSalt = [1]
        });
        context.Categories.AddRange(
            new Category
            {
                Id = 1,
                Name = "Alimentacao",
                UserId = 1
            },
            new Category
            {
                Id = 2,
                Name = "Transporte",
                UserId = 1
            },
            new Category
            {
                Id = 3,
                Name = "Outros",
                UserId = 1
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
