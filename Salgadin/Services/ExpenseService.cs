// Services/ExpenseService.cs
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContext;

        public ExpenseService(IUnitOfWork unitOfWork, IMapper mapper, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userContext = userContext;
        }
        public async Task<ExpenseDto?> GetExpenseByIdAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var expense = await _unitOfWork.Expenses.GetQueryable()
                .Include(e => e.Category) // Incluir a categoria para o DTO
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            return _mapper.Map<ExpenseDto>(expense);
        }
        public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
        {
            var userId = _userContext.GetUserId();
            var expenses = await _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId)
                .Include(e => e.Category)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }
        public async Task<IEnumerable<ExpenseDto>> GetFilteredExpensesAsync(DateTime? startDate, DateTime? endDate, string? category)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            if (startDate.HasValue)
                query = query.Where(e => e.Date.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(e => e.Date.Date <= endDate.Value.Date);

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(e => e.Category != null && e.Category.Name.Equals(category, StringComparison.OrdinalIgnoreCase));

            var expenses = await query
                .Include(e => e.Category)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }
        public async Task<IEnumerable<DailySummaryDto>> GetDailySummaryAsync(DateTime? startDate, DateTime? endDate)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            if (startDate.HasValue)
                query = query.Where(e => e.Date.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(e => e.Date.Date <= endDate.Value.Date);


            var summary = await query
                .GroupBy(e => e.Date.Date)
                .Select(group => new DailySummaryDto
                {
                    Date = group.Key,
                    Total = group.Sum(x => x.Amount),
                    TotalByCategory = group
                        .GroupBy(x => x.Category != null ? x.Category.Name : "Sem Categoria")
                        .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount))
                })
                .OrderByDescending(r => r.Date)
                .ToListAsync();

            return summary;
        }
        public async Task<PagedResult<ExpenseDto>> GetPagedAsync(int page, int pageSize, DateTime? startDate, DateTime? endDate, string? category)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            if (startDate.HasValue)
                query = query.Where(e => e.Date.Date >= startDate.Value.Date);
            if (endDate.HasValue)
                query = query.Where(e => e.Date.Date <= endDate.Value.Date);
            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(e => e.Category != null && e.Category.Name.Equals(category, StringComparison.OrdinalIgnoreCase));

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(e => e.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(e => e.Category)
                .ToListAsync();

            return new PagedResult<ExpenseDto>
            {
                Items = _mapper.Map<IEnumerable<ExpenseDto>>(items),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }
        public async Task<ExpenseDto> AddExpenseAsync(CreateExpenseDto dto)
        {
            var userId = _userContext.GetUserId();
            var expense = _mapper.Map<Expense>(dto);
            expense.UserId = userId;

            await _unitOfWork.Expenses.AddAsync(expense);
            await _unitOfWork.CompleteAsync();

            var createdExpenseWithCategory = await _unitOfWork.Expenses.GetQueryable()
                .Include(e => e.Category)
                .FirstAsync(e => e.Id == expense.Id);

            return _mapper.Map<ExpenseDto>(createdExpenseWithCategory);
        }
        public async Task UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            var userId = _userContext.GetUserId();
            var existing = await _unitOfWork.Expenses
                .GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (existing == null)
                throw new KeyNotFoundException("Despesa não encontrada ou acesso negado.");

            _mapper.Map(dto, existing);
            _unitOfWork.Expenses.Update(existing);
            await _unitOfWork.CompleteAsync();
        }
        public async Task DeleteExpenseAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var expense = await _unitOfWork.Expenses
                .GetQueryable()
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (expense == null)
                throw new KeyNotFoundException("Despesa não encontrada ou acesso negado.");

            _unitOfWork.Expenses.Delete(expense);
            await _unitOfWork.CompleteAsync();
        }
    }
}