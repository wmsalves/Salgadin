using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class SubcategoryService : ISubcategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContext;

        public SubcategoryService(IUnitOfWork unitOfWork, IMapper mapper, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<IEnumerable<SubcategoryDto>> GetAllByCategoryAsync(int categoryId)
        {
            var userId = _userContext.GetUserId();
            var subcategories = await _unitOfWork.Subcategories.GetQueryable()
                .Where(sc => sc.UserId == userId && sc.CategoryId == categoryId)
                .OrderBy(sc => sc.Name)
                .ToListAsync();

            return _mapper.Map<IEnumerable<SubcategoryDto>>(subcategories);
        }

        public async Task<SubcategoryDto?> GetByIdAsync(int categoryId, int id)
        {
            var userId = _userContext.GetUserId();
            var subcategory = await _unitOfWork.Subcategories.GetQueryable()
                .FirstOrDefaultAsync(sc => sc.Id == id && sc.UserId == userId && sc.CategoryId == categoryId);

            return subcategory == null ? null : _mapper.Map<SubcategoryDto>(subcategory);
        }

        public async Task<SubcategoryDto> CreateAsync(int categoryId, CreateSubcategoryDto dto)
        {
            var userId = _userContext.GetUserId();
            var normalizedName = dto.Name.Trim();
            var category = await _unitOfWork.Categories.GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);

            if (category == null)
            {
                throw new KeyNotFoundException("Categoria não encontrada.");
            }

            if (await _unitOfWork.Subcategories.GetQueryable()
                .AnyAsync(sc => sc.UserId == userId
                    && sc.CategoryId == categoryId
                    && sc.Name.ToLower() == normalizedName.ToLower()))
            {
                throw new BadInputException("JÃ¡ existe uma subcategoria com esse nome nessa categoria.");
            }

            var subcategory = _mapper.Map<Subcategory>(dto);
            subcategory.Name = normalizedName;
            subcategory.CategoryId = categoryId;
            subcategory.UserId = userId;

            await _unitOfWork.Subcategories.AddAsync(subcategory);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<SubcategoryDto>(subcategory);
        }

        public async Task<SubcategoryDto?> UpdateAsync(int categoryId, int id, UpdateSubcategoryDto dto)
        {
            var userId = _userContext.GetUserId();
            var normalizedName = dto.Name.Trim();
            var subcategory = await _unitOfWork.Subcategories.GetQueryable()
                .FirstOrDefaultAsync(sc => sc.Id == id && sc.UserId == userId && sc.CategoryId == categoryId);

            if (subcategory == null)
            {
                return null;
            }

            if (await _unitOfWork.Subcategories.GetQueryable()
                .AnyAsync(sc => sc.UserId == userId
                    && sc.CategoryId == categoryId
                    && sc.Id != id
                    && sc.Name.ToLower() == normalizedName.ToLower()))
            {
                throw new BadInputException("JÃ¡ existe uma subcategoria com esse nome nessa categoria.");
            }

            subcategory.Name = normalizedName;

            _unitOfWork.Subcategories.Update(subcategory);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<SubcategoryDto>(subcategory);
        }

        public async Task DeleteAsync(int categoryId, int id)
        {
            var userId = _userContext.GetUserId();
            var subcategory = await _unitOfWork.Subcategories.GetQueryable()
                .FirstOrDefaultAsync(sc => sc.Id == id && sc.UserId == userId && sc.CategoryId == categoryId);

            if (subcategory == null)
            {
                return;
            }

            var hasExpenses = await _unitOfWork.Expenses.GetQueryable()
                .AnyAsync(e => e.SubcategoryId == id);

            if (hasExpenses)
            {
                throw new InvalidOperationException("Não é possível excluir uma subcategoria que já está em uso por uma despesa.");
            }

            _unitOfWork.Subcategories.Delete(subcategory);
            await _unitOfWork.CompleteAsync();
        }
    }
}
