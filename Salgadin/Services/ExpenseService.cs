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

        public ExpenseService(IExpenseRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
        {
            var expenses = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<Expense?> GetExpenseByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddExpenseAsync(CreateExpenseDto dto)
        {
            var expense = _mapper.Map<Expense>(dto);
            await _repository.AddAsync(expense);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteExpenseAsync(int id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
        public async Task<IEnumerable<ExpenseDto>> GetFilteredExpensesAsync(DateTime? startDate, DateTime? endDate, string? category)
        {
            var allExpenses = await _repository.GetAllAsync();

            var filtered = allExpenses.Where(e =>
                (!startDate.HasValue || e.Date >= startDate.Value) &&
                (!endDate.HasValue || e.Date <= endDate.Value) &&
                (string.IsNullOrWhiteSpace(category) || e.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            );

            return _mapper.Map<IEnumerable<ExpenseDto>>(filtered);
        }
        public async Task UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) throw new Exception("Expense not found");

            _mapper.Map(dto, existing); // aplica atualizações no objeto existente
            await _repository.SaveChangesAsync();
        }

        public async Task<IEnumerable<DailySummaryDto>> GetDailySummaryAsync(DateTime? startDate, DateTime? endDate)
        {
            var expenses = await _repository.GetAllAsync();

            var filtered = expenses
                .Where(e =>
                    (!startDate.HasValue || e.Date >= startDate.Value) &&
                    (!endDate.HasValue || e.Date <= endDate.Value))
                .GroupBy(e => e.Date.Date)
                .Select(group => new DailySummaryDto
                {
                    Date = group.Key,
                    Total = group.Sum(x => x.Amount),
                    TotalByCategory = group
                        .GroupBy(x => x.Category)
                        .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount))
                });

            return filtered.OrderByDescending(r => r.Date);
        }
    }
}
