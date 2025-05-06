using Microsoft.EntityFrameworkCore;
using Salgadin.Models;

namespace Salgadin.Data
{
    public class SalgadinContext : DbContext
    {
        public SalgadinContext(DbContextOptions<SalgadinContext> options)
            : base(options)
        {
        }

        public DbSet<Expense> Expenses { get; set; } = null!;
    }
}
