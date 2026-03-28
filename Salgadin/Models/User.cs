namespace Salgadin.Models
{
    public class User : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public byte[] PasswordHash { get; set; } = null!;

        public byte[] PasswordSalt { get; set; } = null!;

        public ICollection<Expense>? Expenses { get; set; }

        public ICollection<Category>? Categories { get; set; }

        public ICollection<Subcategory>? Subcategories { get; set; }

        public ICollection<BudgetGoal>? BudgetGoals { get; set; }

        public ICollection<Income>? Incomes { get; set; }

        public NotificationPreference? NotificationPreference { get; set; }
    }
}
