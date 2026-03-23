using Salgadin.Models;

namespace Salgadin.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Expense> Expenses { get; }
        IRepository<Category> Categories { get; }
        IRepository<Subcategory> Subcategories { get; }
        IRepository<BudgetGoal> BudgetGoals { get; }
        IRepository<User> Users { get; }
        Task<int> CompleteAsync();
    }
}
