using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface ISubcategoryService
    {
        Task<IEnumerable<SubcategoryDto>> GetAllByCategoryAsync(int categoryId);
        Task<SubcategoryDto?> GetByIdAsync(int categoryId, int id);
        Task<SubcategoryDto> CreateAsync(int categoryId, CreateSubcategoryDto dto);
        Task<SubcategoryDto?> UpdateAsync(int categoryId, int id, UpdateSubcategoryDto dto);
        Task DeleteAsync(int categoryId, int id);
    }
}
