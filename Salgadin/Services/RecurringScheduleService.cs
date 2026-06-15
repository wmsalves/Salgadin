using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class RecurringScheduleService : IRecurringScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        private readonly INotificationService _notificationService;

        public RecurringScheduleService(
            IUnitOfWork unitOfWork,
            IUserContextService userContext,
            INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<RecurringScheduleDto>> GetAllAsync()
        {
            var userId = _userContext.GetUserId();
            var schedules = await BaseQuery(userId)
                .OrderBy(item => item.Status)
                .ThenBy(item => item.NextOccurrenceDate)
                .ToListAsync();

            return schedules.Select(Map);
        }

        public async Task<RecurringScheduleSummaryDto> GetSummaryAsync()
        {
            var userId = _userContext.GetUserId();
            var today = AsUtcStartOfDay(DateTime.UtcNow);
            var schedules = await _unitOfWork.RecurringSchedules.GetQueryable()
                .Where(item => item.UserId == userId && item.Status != RecurringScheduleStatus.Archived)
                .ToListAsync();

            return new RecurringScheduleSummaryDto
            {
                Total = schedules.Count,
                Active = schedules.Count(item => item.Status == RecurringScheduleStatus.Active),
                Paused = schedules.Count(item => item.Status == RecurringScheduleStatus.Paused),
                Due = schedules.Count(item =>
                    item.Status == RecurringScheduleStatus.Active &&
                    item.NextOccurrenceDate <= today),
                NextOccurrenceDate = schedules
                    .Where(item => item.Status == RecurringScheduleStatus.Active)
                    .OrderBy(item => item.NextOccurrenceDate)
                    .Select(item => (DateTime?)item.NextOccurrenceDate)
                    .FirstOrDefault(),
                LastGenerationDate = schedules
                    .Where(item => item.LastGeneratedOccurrenceDate.HasValue)
                    .OrderByDescending(item => item.LastGeneratedOccurrenceDate)
                    .Select(item => item.LastGeneratedOccurrenceDate)
                    .FirstOrDefault()
            };
        }

        public async Task<RecurringScheduleDto?> GetByIdAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var schedule = await BaseQuery(userId)
                .FirstOrDefaultAsync(item => item.Id == id);

            return schedule is null ? null : Map(schedule);
        }

        public async Task<RecurringScheduleDto> CreateAsync(CreateRecurringScheduleDto dto)
        {
            var userId = _userContext.GetUserId();
            var type = ParseType(dto.Type);
            var frequency = ParseFrequency(dto.Frequency);
            var now = DateTime.UtcNow;
            var startDate = AsUtcStartOfDay(dto.StartDate);
            var endDate = dto.EndDate.HasValue ? AsUtcStartOfDay(dto.EndDate.Value) : (DateTime?)null;

            ValidateCommon(dto.Description, dto.Amount, dto.DayOfMonth, startDate, endDate);
            await ValidateCategoryAsync(userId, type, dto.CategoryId, dto.SubcategoryId);

            var schedule = new RecurringSchedule
            {
                UserId = userId,
                Type = type,
                Description = dto.Description.Trim(),
                Amount = dto.Amount,
                CategoryId = type == RecurringScheduleType.Expense ? dto.CategoryId : null,
                SubcategoryId = type == RecurringScheduleType.Expense ? dto.SubcategoryId : null,
                Frequency = frequency,
                StartDate = startDate,
                EndDate = endDate,
                DayOfMonth = dto.DayOfMonth,
                NextOccurrenceDate = GetOccurrenceDate(startDate.Year, startDate.Month, dto.DayOfMonth),
                Status = dto.IsActive ? RecurringScheduleStatus.Active : RecurringScheduleStatus.Paused,
                Source = RecurringScheduleSource.Manual,
                CreatedAt = now,
                UpdatedAt = now
            };

            if (schedule.NextOccurrenceDate < startDate)
            {
                schedule.NextOccurrenceDate = GetNextMonthlyOccurrence(schedule.NextOccurrenceDate, schedule.DayOfMonth);
            }

            if (endDate.HasValue && schedule.NextOccurrenceDate > endDate.Value)
            {
                schedule.Status = RecurringScheduleStatus.Finished;
            }

            await _unitOfWork.RecurringSchedules.AddAsync(schedule);
            await _unitOfWork.CompleteAsync();

            var created = await BaseQuery(userId).FirstAsync(item => item.Id == schedule.Id);
            return Map(created);
        }

        public async Task<RecurringScheduleDto?> UpdateAsync(int id, UpdateRecurringScheduleDto dto)
        {
            var userId = _userContext.GetUserId();
            var schedule = await _unitOfWork.RecurringSchedules.GetQueryable()
                .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

            if (schedule is null)
            {
                return null;
            }

            var type = ParseType(dto.Type);
            var frequency = ParseFrequency(dto.Frequency);
            var status = ParseStatus(dto.Status);
            var startDate = AsUtcStartOfDay(dto.StartDate);
            var endDate = dto.EndDate.HasValue ? AsUtcStartOfDay(dto.EndDate.Value) : (DateTime?)null;

            ValidateCommon(dto.Description, dto.Amount, dto.DayOfMonth, startDate, endDate);
            await ValidateCategoryAsync(userId, type, dto.CategoryId, dto.SubcategoryId);

            schedule.Type = type;
            schedule.Description = dto.Description.Trim();
            schedule.Amount = dto.Amount;
            schedule.CategoryId = type == RecurringScheduleType.Expense ? dto.CategoryId : null;
            schedule.SubcategoryId = type == RecurringScheduleType.Expense ? dto.SubcategoryId : null;
            schedule.Frequency = frequency;
            schedule.StartDate = startDate;
            schedule.EndDate = endDate;
            schedule.DayOfMonth = dto.DayOfMonth;
            schedule.Status = status;
            schedule.UpdatedAt = DateTime.UtcNow;

            if (schedule.LastGeneratedOccurrenceDate is null)
            {
                schedule.NextOccurrenceDate = GetOccurrenceDate(startDate.Year, startDate.Month, dto.DayOfMonth);
                if (schedule.NextOccurrenceDate < startDate)
                {
                    schedule.NextOccurrenceDate = GetNextMonthlyOccurrence(schedule.NextOccurrenceDate, dto.DayOfMonth);
                }
            }
            else
            {
                schedule.NextOccurrenceDate = GetNextMonthlyOccurrence(schedule.LastGeneratedOccurrenceDate.Value, dto.DayOfMonth);
            }

            if (endDate.HasValue && schedule.NextOccurrenceDate > endDate.Value && status == RecurringScheduleStatus.Active)
            {
                schedule.Status = RecurringScheduleStatus.Finished;
            }

            _unitOfWork.RecurringSchedules.Update(schedule);
            await _unitOfWork.CompleteAsync();

            var updated = await BaseQuery(userId).FirstAsync(item => item.Id == id);
            return Map(updated);
        }

        public async Task<RecurringScheduleDto?> PauseAsync(int id)
        {
            return await ChangeStatusAsync(id, RecurringScheduleStatus.Paused);
        }

        public async Task<RecurringScheduleDto?> ResumeAsync(int id)
        {
            return await ChangeStatusAsync(id, RecurringScheduleStatus.Active);
        }

        public async Task ArchiveAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var schedule = await _unitOfWork.RecurringSchedules.GetQueryable()
                .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

            if (schedule is null)
            {
                return;
            }

            schedule.Status = RecurringScheduleStatus.Archived;
            schedule.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.RecurringSchedules.Update(schedule);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<GenerateRecurringSchedulesResultDto> GenerateDueForCurrentUserAsync(DateTime? untilDate)
        {
            var userId = _userContext.GetUserId();
            return await GenerateDueAsync(userId, untilDate.HasValue ? AsUtcStartOfDay(untilDate.Value) : AsUtcStartOfDay(DateTime.UtcNow));
        }

        public async Task<GenerateRecurringSchedulesResultDto> GenerateDueAsync(int userId, DateTime untilDate)
        {
            var normalizedUntilDate = AsUtcStartOfDay(untilDate);
            var result = new GenerateRecurringSchedulesResultDto
            {
                UntilDate = normalizedUntilDate
            };

            var schedules = await _unitOfWork.RecurringSchedules.GetQueryable()
                .Where(item =>
                    item.UserId == userId &&
                    item.Status == RecurringScheduleStatus.Active &&
                    item.NextOccurrenceDate <= normalizedUntilDate)
                .OrderBy(item => item.NextOccurrenceDate)
                .ToListAsync();

            foreach (var schedule in schedules)
            {
                while (schedule.Status == RecurringScheduleStatus.Active &&
                       schedule.NextOccurrenceDate <= normalizedUntilDate)
                {
                    if (schedule.EndDate.HasValue && schedule.NextOccurrenceDate > schedule.EndDate.Value)
                    {
                        schedule.Status = RecurringScheduleStatus.Finished;
                        result.FinishedSchedules++;
                        break;
                    }

                    var occurrenceDate = schedule.NextOccurrenceDate;
                    var periodYear = occurrenceDate.Year;
                    var periodMonth = occurrenceDate.Month;
                    var created = await TryCreateOccurrenceAsync(schedule, occurrenceDate, periodYear, periodMonth);

                    if (created)
                    {
                        if (schedule.Type == RecurringScheduleType.Income)
                        {
                            result.GeneratedIncomes++;
                        }
                        else
                        {
                            result.GeneratedExpenses++;
                        }
                    }
                    else
                    {
                        result.SkippedDuplicates++;
                    }

                    schedule.LastGeneratedOccurrenceDate = occurrenceDate;
                    schedule.NextOccurrenceDate = GetNextMonthlyOccurrence(occurrenceDate, schedule.DayOfMonth);
                    schedule.UpdatedAt = DateTime.UtcNow;

                    if (schedule.EndDate.HasValue && schedule.NextOccurrenceDate > schedule.EndDate.Value)
                    {
                        schedule.Status = RecurringScheduleStatus.Finished;
                        result.FinishedSchedules++;
                    }
                }

                _unitOfWork.RecurringSchedules.Update(schedule);
            }

            await _unitOfWork.CompleteAsync();
            return result;
        }

        private async Task<RecurringScheduleDto?> ChangeStatusAsync(int id, RecurringScheduleStatus status)
        {
            var userId = _userContext.GetUserId();
            var schedule = await _unitOfWork.RecurringSchedules.GetQueryable()
                .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

            if (schedule is null)
            {
                return null;
            }

            schedule.Status = status;
            schedule.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.RecurringSchedules.Update(schedule);
            await _unitOfWork.CompleteAsync();

            var updated = await BaseQuery(userId).FirstAsync(item => item.Id == id);
            return Map(updated);
        }

        private async Task<bool> TryCreateOccurrenceAsync(
            RecurringSchedule schedule,
            DateTime occurrenceDate,
            int periodYear,
            int periodMonth)
        {
            if (schedule.Type == RecurringScheduleType.Income)
            {
                var incomeExists = await _unitOfWork.Incomes.GetQueryable()
                    .AnyAsync(item =>
                        item.UserId == schedule.UserId &&
                        item.RecurringScheduleId == schedule.Id &&
                        item.RecurringPeriodYear == periodYear &&
                        item.RecurringPeriodMonth == periodMonth);

                if (incomeExists)
                {
                    return false;
                }

                await _unitOfWork.Incomes.AddAsync(new Income
                {
                    UserId = schedule.UserId,
                    Description = schedule.Description,
                    Amount = schedule.Amount,
                    Date = occurrenceDate,
                    IsFixed = false,
                    RecurringScheduleId = schedule.Id,
                    RecurringPeriodYear = periodYear,
                    RecurringPeriodMonth = periodMonth
                });

                return true;
            }

            var expenseExists = await _unitOfWork.Expenses.GetQueryable()
                .AnyAsync(item =>
                    item.UserId == schedule.UserId &&
                    item.RecurringScheduleId == schedule.Id &&
                    item.RecurringPeriodYear == periodYear &&
                    item.RecurringPeriodMonth == periodMonth);

            if (expenseExists)
            {
                return false;
            }

            if (!schedule.CategoryId.HasValue)
            {
                throw new BadInputException("Despesa recorrente precisa de categoria.");
            }

            await _unitOfWork.Expenses.AddAsync(new Expense
            {
                UserId = schedule.UserId,
                Description = schedule.Description,
                Amount = schedule.Amount,
                CategoryId = schedule.CategoryId.Value,
                SubcategoryId = schedule.SubcategoryId,
                Date = occurrenceDate,
                RecurringScheduleId = schedule.Id,
                RecurringPeriodYear = periodYear,
                RecurringPeriodMonth = periodMonth
            });

            await _unitOfWork.CompleteAsync();
            try
            {
                await _notificationService.GenerateGoalNotificationsAsync(occurrenceDate);
            }
            catch
            {
                // Nao falha a geracao da despesa recorrente caso a notificacao tenha erro.
            }

            return true;
        }

        private IQueryable<RecurringSchedule> BaseQuery(int userId)
        {
            return _unitOfWork.RecurringSchedules.GetQueryable()
                .Where(item => item.UserId == userId && item.Status != RecurringScheduleStatus.Archived)
                .Include(item => item.Category)
                .Include(item => item.Subcategory);
        }

        private async Task ValidateCategoryAsync(
            int userId,
            RecurringScheduleType type,
            int? categoryId,
            int? subcategoryId)
        {
            if (type == RecurringScheduleType.Income)
            {
                return;
            }

            if (!categoryId.HasValue)
            {
                throw new BadInputException("Despesa recorrente precisa de categoria.");
            }

            var categoryExists = await _unitOfWork.Categories.GetQueryable()
                .AnyAsync(item => item.Id == categoryId.Value && item.UserId == userId);

            if (!categoryExists)
            {
                throw new BadInputException("Categoria nao encontrada.");
            }

            if (!subcategoryId.HasValue)
            {
                return;
            }

            var subcategoryExists = await _unitOfWork.Subcategories.GetQueryable()
                .AnyAsync(item =>
                    item.Id == subcategoryId.Value &&
                    item.CategoryId == categoryId.Value &&
                    item.UserId == userId);

            if (!subcategoryExists)
            {
                throw new BadInputException("Subcategoria nao encontrada para esta categoria.");
            }
        }

        private static void ValidateCommon(
            string description,
            decimal amount,
            int dayOfMonth,
            DateTime startDate,
            DateTime? endDate)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                throw new BadInputException("Descricao e obrigatoria.");
            }

            if (amount <= 0)
            {
                throw new BadInputException("Valor deve ser maior que zero.");
            }

            if (dayOfMonth < 1 || dayOfMonth > 31)
            {
                throw new BadInputException("Dia do mes deve estar entre 1 e 31.");
            }

            if (endDate.HasValue && endDate.Value < startDate)
            {
                throw new BadInputException("Data final nao pode ser menor que a data inicial.");
            }
        }

        private static RecurringScheduleType ParseType(string value)
        {
            return Enum.TryParse<RecurringScheduleType>(value, ignoreCase: true, out var parsed)
                ? parsed
                : throw new BadInputException("Tipo de recorrencia invalido.");
        }

        private static RecurringScheduleFrequency ParseFrequency(string value)
        {
            return Enum.TryParse<RecurringScheduleFrequency>(value, ignoreCase: true, out var parsed) &&
                   parsed == RecurringScheduleFrequency.Monthly
                ? parsed
                : throw new BadInputException("Frequencia de recorrencia invalida.");
        }

        private static RecurringScheduleStatus ParseStatus(string value)
        {
            return Enum.TryParse<RecurringScheduleStatus>(value, ignoreCase: true, out var parsed)
                ? parsed
                : throw new BadInputException("Status de recorrencia invalido.");
        }

        private static RecurringScheduleDto Map(RecurringSchedule schedule)
        {
            return new RecurringScheduleDto
            {
                Id = schedule.Id,
                Type = schedule.Type.ToString(),
                Description = schedule.Description,
                Amount = schedule.Amount,
                CategoryId = schedule.CategoryId,
                Category = schedule.Category?.Name,
                SubcategoryId = schedule.SubcategoryId,
                Subcategory = schedule.Subcategory?.Name,
                Frequency = schedule.Frequency.ToString(),
                StartDate = schedule.StartDate,
                EndDate = schedule.EndDate,
                DayOfMonth = schedule.DayOfMonth,
                NextOccurrenceDate = schedule.NextOccurrenceDate,
                LastGeneratedOccurrenceDate = schedule.LastGeneratedOccurrenceDate,
                Status = schedule.Status.ToString(),
                Source = schedule.Source.ToString(),
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt
            };
        }

        private static DateTime GetNextMonthlyOccurrence(DateTime currentOccurrence, int dayOfMonth)
        {
            var nextMonth = currentOccurrence.AddMonths(1);
            return GetOccurrenceDate(nextMonth.Year, nextMonth.Month, dayOfMonth);
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
