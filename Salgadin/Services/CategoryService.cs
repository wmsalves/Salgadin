using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Salgadin.Data;
using Salgadin.DTOs;
using Salgadin.Models;

namespace Salgadin.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly SalgadinContext _context;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContext;

        public CategoryService(SalgadinContext context, IMapper mapper, IUserContextService userContext)
        {
            _context = context;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var userId = _userContext.GetUserId();
            var categories = await _context.Categories
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            return category == null ? null : _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            var userId = _userContext.GetUserId();
            var category = _mapper.Map<Category>(dto);
            category.UserId = userId;
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return _mapper.Map<CategoryDto>(category);
        }

        public async Task DeleteAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
    }
}
