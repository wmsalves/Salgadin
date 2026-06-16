using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class CalendarService : ICalendarService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;

        public CalendarService(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }

        public async Task<CalendarMonthDto> GetMonthAsync(int? year, int? month)
        {
            var now = DateTime.UtcNow;
            var targetYear = year ?? now.Year;
            var targetMonth = month ?? now.Month;

            if (targetMonth < 1 || targetMonth > 12)
            {
                throw new BadInputException("Mes invalido.");
            }

            if (targetYear < 2000 || targetYear > 2100)
            {
                throw new BadInputException("Ano invalido.");
            }

            var userId = _userContext.GetUserId();
            var start = new DateTime(targetYear, targetMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = start.AddMonths(1);
            var days = BuildMonthDays(start, end);

            var expenses = await _unitOfWork.Expenses.GetQueryable()
                .Where(item => item.UserId == userId && item.Date >= start && item.Date < end)
                .Include(item => item.Category)
                .Include(item => item.Subcategory)
                .ToListAsync();

            var incomes = await _unitOfWork.Incomes.GetQueryable()
                .Where(item => item.UserId == userId && item.Date >= start && item.Date < end)
                .ToListAsync();

            foreach (var income in incomes)
            {
                var day = days[AsUtcStartOfDay(income.Date)];
                day.IncomeTotal += income.Amount;
                day.Incomes.Add(new CalendarEntryDto
                {
                    Id = income.Id,
                    Type = RecurringScheduleType.Income.ToString(),
                    Description = income.Description,
                    Amount = income.Amount,
                    IsRecurring = income.RecurringScheduleId.HasValue,
                    RecurringScheduleId = income.RecurringScheduleId
                });
            }

            foreach (var expense in expenses)
            {
                var day = days[AsUtcStartOfDay(expense.Date)];
                day.ExpenseTotal += expense.Amount;
                day.Expenses.Add(new CalendarEntryDto
                {
                    Id = expense.Id,
                    Type = RecurringScheduleType.Expense.ToString(),
                    Description = expense.Description,
                    Amount = expense.Amount,
                    Category = expense.Category?.Name,
                    Subcategory = expense.Subcategory?.Name,
                    IsRecurring = expense.RecurringScheduleId.HasValue,
                    RecurringScheduleId = expense.RecurringScheduleId
                });
            }

            var registeredRecurringKeys = incomes
                .Where(item => item.RecurringScheduleId.HasValue && item.RecurringPeriodYear.HasValue && item.RecurringPeriodMonth.HasValue)
                .Select(item => BuildRecurringKey(
                    item.RecurringScheduleId!.Value,
                    RecurringScheduleType.Income,
                    item.RecurringPeriodYear!.Value,
                    item.RecurringPeriodMonth!.Value))
                .Concat(expenses
                    .Where(item => item.RecurringScheduleId.HasValue && item.RecurringPeriodYear.HasValue && item.RecurringPeriodMonth.HasValue)
                    .Select(item => BuildRecurringKey(
                        item.RecurringScheduleId!.Value,
                        RecurringScheduleType.Expense,
                        item.RecurringPeriodYear!.Value,
                        item.RecurringPeriodMonth!.Value)))
                .ToHashSet();

            var schedules = await _unitOfWork.RecurringSchedules.GetQueryable()
                .Where(item =>
                    item.UserId == userId &&
                    item.Status == RecurringScheduleStatus.Active &&
                    item.StartDate < end &&
                    (!item.EndDate.HasValue || item.EndDate.Value >= start))
                .Include(item => item.Category)
                .Include(item => item.Subcategory)
                .ToListAsync();

            foreach (var schedule in schedules)
            {
                var occurrenceDate = GetOccurrenceDate(targetYear, targetMonth, schedule.DayOfMonth);

                if (occurrenceDate < AsUtcStartOfDay(schedule.StartDate) ||
                    (schedule.EndDate.HasValue && occurrenceDate > AsUtcStartOfDay(schedule.EndDate.Value)))
                {
                    continue;
                }

                var key = BuildRecurringKey(schedule.Id, schedule.Type, targetYear, targetMonth);
                var isRegistered = registeredRecurringKeys.Contains(key);
                var day = days[occurrenceDate];

                day.Recurrences.Add(new CalendarRecurringItemDto
                {
                    Id = schedule.Id,
                    Type = schedule.Type.ToString(),
                    Description = schedule.Description,
                    Amount = schedule.Amount,
                    Category = schedule.Category?.Name,
                    Subcategory = schedule.Subcategory?.Name,
                    OccurrenceDate = occurrenceDate,
                    Status = isRegistered ? "Registered" : "Predicted"
                });

                if (isRegistered)
                {
                    continue;
                }

                if (schedule.Type == RecurringScheduleType.Income)
                {
                    day.IncomeTotal += schedule.Amount;
                }
                else
                {
                    day.ExpenseTotal += schedule.Amount;
                }
            }

            foreach (var day in days.Values)
            {
                day.Balance = day.IncomeTotal - day.ExpenseTotal;
                day.Incomes = day.Incomes.OrderBy(item => item.Description).ToList();
                day.Expenses = day.Expenses.OrderBy(item => item.Description).ToList();
                day.Recurrences = day.Recurrences
                    .OrderBy(item => item.Type)
                    .ThenBy(item => item.Description)
                    .ToList();
            }

            var orderedDays = days.Values.OrderBy(item => item.Date).ToList();
            var predictedIncome = orderedDays.Sum(item => item.IncomeTotal);
            var predictedExpense = orderedDays.Sum(item => item.ExpenseTotal);

            return new CalendarMonthDto
            {
                Year = targetYear,
                Month = targetMonth,
                StartDate = start,
                EndDate = end.AddDays(-1),
                PredictedIncome = predictedIncome,
                PredictedExpense = predictedExpense,
                PredictedBalance = predictedIncome - predictedExpense,
                Days = orderedDays
            };
        }

        private static Dictionary<DateTime, CalendarDayDto> BuildMonthDays(DateTime start, DateTime end)
        {
            var days = new Dictionary<DateTime, CalendarDayDto>();

            for (var day = start; day < end; day = day.AddDays(1))
            {
                days[day] = new CalendarDayDto
                {
                    Date = day
                };
            }

            return days;
        }

        private static string BuildRecurringKey(
            int recurringScheduleId,
            RecurringScheduleType type,
            int year,
            int month)
        {
            return $"{recurringScheduleId}:{type}:{year:D4}:{month:D2}";
        }

        private static DateTime GetOccurrenceDate(int year, int month, int dayOfMonth)
        {
            var day = Math.Min(dayOfMonth, DateTime.DaysInMonth(year, month));
            return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
        }

        private static DateTime AsUtcStartOfDay(DateTime value)
        {
            var utc = value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };

            return new DateTime(utc.Year, utc.Month, utc.Day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}
