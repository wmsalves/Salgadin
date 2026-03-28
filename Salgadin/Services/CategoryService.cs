using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Models;
using Salgadin.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Salgadin.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContext;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var userId = _userContext.GetUserId();
            var categories = await _unitOfWork.Categories
                .GetQueryable()
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<IEnumerable<CategorySummaryDto>> GetSummaryAsync(int year, int month)
        {
            var userId = _userContext.GetUserId();
            
            var categories = await _unitOfWork.Categories
                .GetQueryable()
                .Where(c => c.UserId == userId)
                .ToListAsync();

            var goals = await _unitOfWork.BudgetGoals
                .GetQueryable()
                .Where(g => g.UserId == userId)
                .ToListAsync();

            var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endExclusive = start.AddMonths(1);

            var expensesGrouped = await _unitOfWork.Expenses
                .GetQueryable()
                .Where(e => e.UserId == userId && e.Date >= start && e.Date < endExclusive)
                .GroupBy(e => e.CategoryId)
                .Select(g => new { CategoryId = g.Key, Total = g.Sum(x => x.Amount) })
                .ToListAsync();

            return categories.Select(c => new CategorySummaryDto
            {
                Id = c.Id,
                Name = c.Name,
                Spent = expensesGrouped.FirstOrDefault(e => e.CategoryId == c.Id)?.Total ?? 0m,
                Limit = goals.FirstOrDefault(g => g.CategoryId == c.Id)?.MonthlyLimit ?? 0m
            });
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var category = await _unitOfWork.Categories
                .GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            return category == null ? null : _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            var userId = _userContext.GetUserId();
            var category = _mapper.Map<Category>(dto);
            category.UserId = userId;

            await _unitOfWork.Categories.AddAsync(category);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var userId = _userContext.GetUserId();
            var category = await _unitOfWork.Categories
                .GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
            {
                return null;
            }

            category.Name = dto.Name;

            _unitOfWork.Categories.Update(category);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task DeleteAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var category = await _unitOfWork.Categories
                .GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category != null)
            {
                var hasExpenses = await _unitOfWork.Expenses.GetQueryable().AnyAsync(e => e.CategoryId == id);
                if (hasExpenses)
                {
                    throw new InvalidOperationException("Não é possível excluir uma categoria que já está em uso por uma despesa.");
                }

                _unitOfWork.Categories.Delete(category);
                await _unitOfWork.CompleteAsync();
            }
        }
    }
}