using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Models;
using Salgadin.Repositories;

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

        public async Task DeleteAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var category = await _unitOfWork.Categories
                .GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category != null)
            {
                _unitOfWork.Categories.Delete(category);
                await _unitOfWork.CompleteAsync();
            }
        }
    }
}