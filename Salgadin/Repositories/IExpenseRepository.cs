using Salgadin.Models;

namespace Salgadin.Repositories
{
    public interface IExpenseRepository
    {
        Task<IEnumerable<Expense>> GetAllAsync();
        Task<Expense?> GetByIdAsync(int id);
        Task<Expense?> GetByIdWithCategoryAsync(int id);
        IQueryable<Expense> Query();
        Task AddAsync(Expense expense);
        Task DeleteAsync(int id);
        Task SaveChangesAsync();
    }
}
