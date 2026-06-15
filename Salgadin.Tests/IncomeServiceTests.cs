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

public class IncomeServiceTests
{
    [Fact]
    public async Task AddIncomeAsync_CanLinkManualIncomeToRecurringSchedule()
    {
        await using var context = CreateContext();
        context.Users.Add(new User
        {
            Id = 1,
            Name = "Usuario",
            Username = "user@example.com",
            PasswordHash = [1],
            PasswordSalt = [1]
        });
        context.RecurringSchedules.Add(new RecurringSchedule
        {
            Id = 20,
            UserId = 1,
            Type = RecurringScheduleType.Income,
            Description = "Salario",
            Amount = 4200m,
            Frequency = RecurringScheduleFrequency.Monthly,
            StartDate = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc),
            DayOfMonth = 5,
            NextOccurrenceDate = new DateTime(2026, 5, 5, 0, 0, 0, DateTimeKind.Utc),
            Status = RecurringScheduleStatus.Active,
            Source = RecurringScheduleSource.Manual,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        var created = await service.AddIncomeAsync(new CreateIncomeDto
        {
            Description = "Salario",
            Amount = 4200m,
            Date = new DateTime(2026, 5, 5),
            IsFixed = false,
            RecurringScheduleId = 20
        });

        var saved = await context.Incomes.SingleAsync(item => item.Id == created.Id);
        Assert.Equal(20, saved.RecurringScheduleId);
        Assert.Equal(2026, saved.RecurringPeriodYear);
        Assert.Equal(5, saved.RecurringPeriodMonth);
    }

    private static IncomeService CreateService(IUnitOfWork unitOfWork)
    {
        var mapper = new MapperConfiguration(
                cfg => cfg.AddProfile<AutoMapperProfile>(),
                NullLoggerFactory.Instance)
            .CreateMapper();

        return new IncomeService(unitOfWork, mapper, new FakeUserContextService());
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SalgadinContext(options);
    }

    private sealed class FakeUserContextService : IUserContextService
    {
        public int GetUserId() => 1;
    }
}
