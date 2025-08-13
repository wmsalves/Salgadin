using Salgadin.Models;

namespace Salgadin.Repositories
{
    public interface IExpenseRepository
    {
        Task<IEnumerable<Expense>> GetAllAsync();
        Task<Expense?> GetByIdAsync(int id);
        Task AddAsync(Expense expense);
        Task DeleteAsync(int id);
        Task SaveChangesAsync();
        IQueryable<Expense> Query();
        Task<Expense?> GetByIdWithCategoryAsync(int id);
    }
}
