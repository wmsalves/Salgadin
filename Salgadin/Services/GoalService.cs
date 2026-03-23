using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class GoalService : IGoalService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;

        public GoalService(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }

        public async Task<IEnumerable<GoalDto>> GetAllAsync()
        {
            var userId = _userContext.GetUserId();
            var goals = await _unitOfWork.BudgetGoals.GetQueryable()
                .Where(g => g.UserId == userId)
                .OrderBy(g => g.CategoryId)
                .ToListAsync();

            return await MapGoalsAsync(goals, userId);
        }

        public async Task<GoalDto?> GetByIdAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var goal = await _unitOfWork.BudgetGoals.GetQueryable()
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (goal == null)
            {
                return null;
            }

            var dtoList = await MapGoalsAsync(new[] { goal }, userId);
            return dtoList.First();
        }

        public async Task<GoalDto> CreateAsync(CreateGoalDto dto)
        {
            var userId = _userContext.GetUserId();

            await ValidateCategoryAsync(userId, dto.CategoryId);
            await EnsureUniqueGoalAsync(userId, dto.CategoryId, null);

            var goal = new BudgetGoal
            {
                UserId = userId,
                CategoryId = dto.CategoryId,
                MonthlyLimit = dto.MonthlyLimit,
                AlertThreshold = dto.AlertThreshold,
                IsActive = dto.IsActive
            };

            await _unitOfWork.BudgetGoals.AddAsync(goal);
            await _unitOfWork.CompleteAsync();

            var dtoList = await MapGoalsAsync(new[] { goal }, userId);
            return dtoList.First();
        }

        public async Task<GoalDto?> UpdateAsync(int id, UpdateGoalDto dto)
        {
            var userId = _userContext.GetUserId();
            var goal = await _unitOfWork.BudgetGoals.GetQueryable()
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (goal == null)
            {
                return null;
            }

            await ValidateCategoryAsync(userId, dto.CategoryId);
            await EnsureUniqueGoalAsync(userId, dto.CategoryId, id);

            goal.CategoryId = dto.CategoryId;
            goal.MonthlyLimit = dto.MonthlyLimit;
            goal.AlertThreshold = dto.AlertThreshold;
            goal.IsActive = dto.IsActive;

            _unitOfWork.BudgetGoals.Update(goal);
            await _unitOfWork.CompleteAsync();

            var dtoList = await MapGoalsAsync(new[] { goal }, userId);
            return dtoList.First();
        }

        public async Task DeleteAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var goal = await _unitOfWork.BudgetGoals.GetQueryable()
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (goal == null)
            {
                return;
            }

            _unitOfWork.BudgetGoals.Delete(goal);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<GoalAlertDto>> GetAlertsAsync(int year, int month)
        {
            if (month < 1 || month > 12)
            {
                throw new BadInputException("Mês inválido.");
            }

            var userId = _userContext.GetUserId();
            var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endExclusive = start.AddMonths(1);

            var goals = await _unitOfWork.BudgetGoals.GetQueryable()
                .Where(g => g.UserId == userId && g.IsActive)
                .ToListAsync();

            var totalsByCategory = await _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId && e.Date >= start && e.Date < endExclusive)
                .GroupBy(e => e.CategoryId)
                .Select(g => new { CategoryId = g.Key, Total = g.Sum(x => x.Amount) })
                .ToListAsync();

            var totalOverall = totalsByCategory.Sum(x => x.Total);

            var categoryIds = goals.Where(g => g.CategoryId.HasValue).Select(g => g.CategoryId!.Value).Distinct();
            var categories = await _unitOfWork.Categories.GetQueryable()
                .Where(c => c.UserId == userId && categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name);

            var totalsDict = totalsByCategory.ToDictionary(x => x.CategoryId, x => x.Total);

            var alerts = goals.Select(g =>
            {
                var spent = g.CategoryId.HasValue
                    ? (totalsDict.TryGetValue(g.CategoryId.Value, out var total) ? total : 0m)
                    : totalOverall;

                var thresholdReached = g.MonthlyLimit > 0 && (spent / g.MonthlyLimit) >= g.AlertThreshold;

                return new GoalAlertDto
                {
                    GoalId = g.Id,
                    CategoryId = g.CategoryId,
                    Category = g.CategoryId.HasValue && categories.TryGetValue(g.CategoryId.Value, out var name)
                        ? name
                        : null,
                    MonthlyLimit = g.MonthlyLimit,
                    AlertThreshold = g.AlertThreshold,
                    Spent = spent,
                    ThresholdReached = thresholdReached
                };
            }).ToList();

            return alerts;
        }

        private async Task ValidateCategoryAsync(int userId, int? categoryId)
        {
            if (!categoryId.HasValue)
            {
                return;
            }

            var exists = await _unitOfWork.Categories.GetQueryable()
                .AnyAsync(c => c.Id == categoryId.Value && c.UserId == userId);

            if (!exists)
            {
                throw new KeyNotFoundException("Categoria não encontrada.");
            }
        }

        private async Task EnsureUniqueGoalAsync(int userId, int? categoryId, int? ignoreId)
        {
            var query = _unitOfWork.BudgetGoals.GetQueryable()
                .Where(g => g.UserId == userId);

            if (ignoreId.HasValue)
            {
                query = query.Where(g => g.Id != ignoreId.Value);
            }

            query = categoryId.HasValue
                ? query.Where(g => g.CategoryId == categoryId.Value)
                : query.Where(g => g.CategoryId == null);

            var exists = await query.AnyAsync();
            if (exists)
            {
                throw new BadInputException("Já existe uma meta para essa categoria.");
            }
        }

        private async Task<IEnumerable<GoalDto>> MapGoalsAsync(IEnumerable<BudgetGoal> goals, int userId)
        {
            var categoryIds = goals.Where(g => g.CategoryId.HasValue).Select(g => g.CategoryId!.Value).Distinct();
            var categories = await _unitOfWork.Categories.GetQueryable()
                .Where(c => c.UserId == userId && categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name);

            return goals.Select(g => new GoalDto
            {
                Id = g.Id,
                CategoryId = g.CategoryId,
                Category = g.CategoryId.HasValue && categories.TryGetValue(g.CategoryId.Value, out var name)
                    ? name
                    : null,
                MonthlyLimit = g.MonthlyLimit,
                AlertThreshold = g.AlertThreshold,
                IsActive = g.IsActive
            });
        }
    }
}
