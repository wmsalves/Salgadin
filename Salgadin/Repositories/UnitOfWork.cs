using Salgadin.Data;
using Salgadin.Models;
using Microsoft.EntityFrameworkCore;

namespace Salgadin.Repositories
{
    // Classe interna para a implementação do repositório genérico
    internal class Repository<T> : IRepository<T> where T : class, IEntity
    {
        private readonly SalgadinContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(SalgadinContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public IQueryable<T> GetQueryable() => _dbSet.AsQueryable();

        public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

        public void Update(T entity) => _dbSet.Update(entity);

        public void Delete(T entity) => _dbSet.Remove(entity);
    }

    public class UnitOfWork : IUnitOfWork
    {
        private readonly SalgadinContext _context;

        public IRepository<Expense> Expenses { get; }
        public IRepository<Category> Categories { get; }
        public IRepository<User> Users { get; }

        public UnitOfWork(SalgadinContext context)
        {
            _context = context;
            Expenses = new Repository<Expense>(_context);
            Categories = new Repository<Category>(_context);
            Users = new Repository<User>(_context);
        }

        public async Task<int> CompleteAsync() => await _context.SaveChangesAsync();

        public void Dispose() => _context.Dispose();
    }
}