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
    }
}
