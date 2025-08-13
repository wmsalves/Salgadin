using Microsoft.EntityFrameworkCore;
using Salgadin.Data;
using Salgadin.Models;

namespace Salgadin.Repositories
{
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly SalgadinContext _context;

        public ExpenseRepository(SalgadinContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Expense>> GetAllAsync()
        {
            return await _context.Expenses.Include(e => e.Category).ToListAsync();
        }

        public async Task<Expense?> GetByIdAsync(int id)
        {
            return await _context.Expenses.Include(e => e.Category).FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task AddAsync(Expense expense)
        {
            await _context.Expenses.AddAsync(expense);
        }

        public async Task DeleteAsync(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense != null)
                _context.Expenses.Remove(expense);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        public IQueryable<Expense> Query()
        {
            return _context.Expenses.Include(e => e.Category).AsQueryable();
        }

        public async Task<Expense?> GetByIdWithCategoryAsync(int id)
        {
            return await _context.Expenses.Include(e => e.Category)
                                          .FirstOrDefaultAsync(e => e.Id == id);
        }

    }
}
