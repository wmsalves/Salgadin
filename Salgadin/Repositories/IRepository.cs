using Salgadin.Models;
using System.Linq.Expressions;

namespace Salgadin.Repositories
{
    public interface IRepository<T> where T : class, IEntity
    {
        IQueryable<T> GetQueryable();
        Task<T?> GetByIdAsync(int id);
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
    }
}