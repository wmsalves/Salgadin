using AutoMapper;
using Salgadin.DTOs;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _repository;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContext;

        public ExpenseService(IExpenseRepository repository, IMapper mapper, IUserContextService userContext)
        {
            _repository = repository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
        {
            var userId = _userContext.GetUserId();
            var expenses = await _repository.GetAllAsync();
            var filtered = expenses.Where(e => e.UserId == userId);
            return _mapper.Map<IEnumerable<ExpenseDto>>(filtered);
        }

        public async Task<Expense?> GetExpenseByIdAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var expense = await _repository.GetByIdAsync(id);
            return (expense != null && expense.UserId == userId) ? expense : null;
        }

        public async Task AddExpenseAsync(CreateExpenseDto dto)
        {
            var userId = _userContext.GetUserId();
            var expense = _mapper.Map<Expense>(dto);
            expense.UserId = userId;
            await _repository.AddAsync(expense);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteExpenseAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var expense = await _repository.GetByIdAsync(id);
            if (expense == null || expense.UserId != userId)
                throw new Exception("Not found or access denied.");

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            var userId = _userContext.GetUserId();
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null || existing.UserId != userId)
                throw new Exception("Not found or access denied.");

            _mapper.Map(dto, existing);
            await _repository.SaveChangesAsync();
        }

        public async Task<IEnumerable<ExpenseDto>> GetFilteredExpensesAsync(DateTime? startDate, DateTime? endDate, string? category)
        {
            var userId = _userContext.GetUserId();
            var allExpenses = await _repository.GetAllAsync();
            var filtered = allExpenses
                .Where(e => e.UserId == userId)
                .Where(e =>
                    (!startDate.HasValue || e.Date >= startDate.Value) &&
                    (!endDate.HasValue || e.Date <= endDate.Value) &&
                    (string.IsNullOrWhiteSpace(category) || e.Category?.Name.Equals(category, StringComparison.OrdinalIgnoreCase) == true));

            return _mapper.Map<IEnumerable<ExpenseDto>>(filtered);
        }

        public async Task<IEnumerable<DailySummaryDto>> GetDailySummaryAsync(DateTime? startDate, DateTime? endDate)
        {
            var userId = _userContext.GetUserId();
            var expenses = await _repository.GetAllAsync();
            var filtered = expenses
                .Where(e => e.UserId == userId)
                .Where(e =>
                    (!startDate.HasValue || e.Date >= startDate.Value) &&
                    (!endDate.HasValue || e.Date <= endDate.Value))
                .GroupBy(e => e.Date.Date)
                .Select(group => new DailySummaryDto
                {
                    Date = group.Key,
                    Total = group.Sum(x => x.Amount),
                    TotalByCategory = group
                        .GroupBy(x => x.Category?.Name ?? "Desconhecida")
                        .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount))
                });

            return filtered.OrderByDescending(r => r.Date);
        }
    }
}
