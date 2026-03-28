using Salgadin.Models;

namespace Salgadin.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Expense> Expenses { get; }
        IRepository<Category> Categories { get; }
        IRepository<Subcategory> Subcategories { get; }
        IRepository<BudgetGoal> BudgetGoals { get; }
        IRepository<NotificationPreference> NotificationPreferences { get; }
        IRepository<User> Users { get; }
        IRepository<Income> Incomes { get; }
        Task<int> CompleteAsync();
    }
}
