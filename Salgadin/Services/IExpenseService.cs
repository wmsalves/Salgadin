using Salgadin.DTOs;
using Salgadin.Models;

namespace Salgadin.Services
{
    public interface IExpenseService
    {
        Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync();
        Task<Expense?> GetExpenseByIdAsync(int id);
        Task AddExpenseAsync(CreateExpenseDto dto);
        Task DeleteExpenseAsync(int id);
    }
}
