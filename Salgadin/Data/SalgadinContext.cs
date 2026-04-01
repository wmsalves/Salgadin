using Microsoft.EntityFrameworkCore;
using Salgadin.Models;
using System.Reflection;

namespace Salgadin.Data
{
    public class SalgadinContext : DbContext
    {
        public SalgadinContext(DbContextOptions<SalgadinContext> options)
            : base(options)
        {
        }

        public DbSet<Expense> Expenses { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Subcategory> Subcategories { get; set; } = null!;
        public DbSet<BudgetGoal> BudgetGoals { get; set; } = null!;
        public DbSet<NotificationPreference> NotificationPreferences { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Income> Incomes { get; set; } = null!;

        // Sobrescreve o método OnModelCreating para aplicar as configurações.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Procura e aplica todas as classes que implementam IEntityTypeConfiguration
            // no mesmo assembly (projeto) onde esta classe está.
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            base.OnModelCreating(modelBuilder);
        }
    }
}
