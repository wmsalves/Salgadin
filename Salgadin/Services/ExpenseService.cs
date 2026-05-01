// Services/ExpenseService.cs
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContext;
        private readonly INotificationService _notificationService;

        public ExpenseService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IUserContextService userContext,
            INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userContext = userContext;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<DailySummaryDto>> GetDailySummaryAsync(DateTime? startDate, DateTime? endDate)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            var startUtc = startDate.HasValue
                ? AsUtcStartOfDay(startDate.Value)
                : (DateTime?)null;
            var endUtcExclusive = endDate.HasValue
                ? AsUtcStartOfNextDay(endDate.Value)
                : (DateTime?)null;

            if (startUtc.HasValue)
                query = query.Where(e => e.Date >= startUtc.Value);

            if (endUtcExclusive.HasValue)
                query = query.Where(e => e.Date < endUtcExclusive.Value);

            var expensesFromDb = await query
                .Include(e => e.Category)
                .ToListAsync();

            var summary = expensesFromDb
                .GroupBy(e => AsUtcStartOfDay(e.Date))
                .Select(group => new DailySummaryDto
                {
                    Date = group.Key,
                    Total = group.Sum(x => x.Amount),
                    TotalByCategory = group
                        .GroupBy(x => x.Category?.Name ?? "Sem Categoria")
                        .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount))
                })
                .OrderByDescending(r => r.Date);

            return summary;
        }

        public async Task<ExpenseDto> AddExpenseAsync(CreateExpenseDto dto)
        {
            var userId = _userContext.GetUserId();

            var category = await _unitOfWork.Categories.GetByIdAsync(dto.CategoryId);
            if (category == null || category.UserId != userId)
            {
                throw new KeyNotFoundException("Categoria não encontrada.");
            }

            if (dto.SubcategoryId.HasValue)
            {
                await ValidateSubcategoryAsync(userId, dto.CategoryId, dto.SubcategoryId.Value);
            }

            var expense = _mapper.Map<Expense>(dto);
            expense.UserId = userId;

            expense.Date = NormalizeToUtc(dto.Date);

            await _unitOfWork.Expenses.AddAsync(expense);
            await _unitOfWork.CompleteAsync();

            expense.Category = category;

            try
            {
                await _notificationService.GenerateGoalNotificationsAsync(expense.Date);
            }
            catch
            {
                // Nao falha a criacao da despesa caso a notificacao tenha erro.
            }

            return _mapper.Map<ExpenseDto>(expense);
        }

        public async Task<ExpenseDto?> GetExpenseByIdAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var expense = await _unitOfWork.Expenses.GetQueryable()
                .Include(e => e.Category)
                .Include(e => e.Subcategory)
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
            return _mapper.Map<ExpenseDto>(expense);
        }

        public async Task<PagedResult<ExpenseDto>> GetPagedAsync(int page, int pageSize, DateTime? startDate, DateTime? endDate, string? category)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            var startUtc = startDate.HasValue
                ? AsUtcStartOfDay(startDate.Value)
                : (DateTime?)null;
            var endUtcExclusive = endDate.HasValue
                ? AsUtcStartOfNextDay(endDate.Value)
                : (DateTime?)null;

            if (startUtc.HasValue)
                query = query.Where(e => e.Date >= startUtc.Value);
            if (endUtcExclusive.HasValue)
                query = query.Where(e => e.Date < endUtcExclusive.Value);
            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(e => e.Category != null && e.Category.Name.Equals(category, StringComparison.OrdinalIgnoreCase));

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(e => e.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(e => e.Category)
                .Include(e => e.Subcategory)
                .ToListAsync();

            return new PagedResult<ExpenseDto>
            {
                Items = _mapper.Map<IEnumerable<ExpenseDto>>(items),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            var userId = _userContext.GetUserId();
            var existing = await _unitOfWork.Expenses
                .GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (existing == null)
                throw new KeyNotFoundException("Despesa não encontrada ou acesso negado.");

            if (dto.SubcategoryId.HasValue)
            {
                await ValidateSubcategoryAsync(userId, dto.CategoryId, dto.SubcategoryId.Value);
            }

            _mapper.Map(dto, existing);
            existing.Date = NormalizeToUtc(dto.Date);
            _unitOfWork.Expenses.Update(existing);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteExpenseAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var expense = await _unitOfWork.Expenses
                .GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (expense == null)
                throw new KeyNotFoundException("Despesa não encontrada ou acesso negado.");

            _unitOfWork.Expenses.Delete(expense);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
        {
            var userId = _userContext.GetUserId();
            var expenses = await _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId)
                .Include(e => e.Category)
                .Include(e => e.Subcategory)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<IEnumerable<ExpenseDto>> GetFilteredExpensesAsync(DateTime? startDate, DateTime? endDate, string? category)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            var startUtc = startDate.HasValue
                ? AsUtcStartOfDay(startDate.Value)
                : (DateTime?)null;
            var endUtcExclusive = endDate.HasValue
                ? AsUtcStartOfNextDay(endDate.Value)
                : (DateTime?)null;

            if (startUtc.HasValue)
                query = query.Where(e => e.Date >= startUtc.Value);

            if (endUtcExclusive.HasValue)
                query = query.Where(e => e.Date < endUtcExclusive.Value);

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(e => e.Category != null && e.Category.Name.Equals(category, StringComparison.OrdinalIgnoreCase));

            var expenses = await query
                .Include(e => e.Category)
                .Include(e => e.Subcategory)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        private async Task ValidateSubcategoryAsync(int userId, int categoryId, int subcategoryId)
        {
            var subcategory = await _unitOfWork.Subcategories
                .GetQueryable()
                .FirstOrDefaultAsync(sc => sc.Id == subcategoryId && sc.UserId == userId);

            if (subcategory == null || subcategory.CategoryId != categoryId)
            {
                throw new KeyNotFoundException("Subcategoria não encontrada ou inválida para a categoria informada.");
            }
        }

        private static DateTime NormalizeToUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }

        private static DateTime AsUtcStartOfDay(DateTime value)
        {
            var utc = NormalizeToUtc(value);
            return new DateTime(utc.Year, utc.Month, utc.Day, 0, 0, 0, DateTimeKind.Utc);
        }

        private static DateTime AsUtcStartOfNextDay(DateTime value)
        {
            return AsUtcStartOfDay(value).AddDays(1);
        }
    }
}
