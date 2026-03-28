using Salgadin.DTOs;
using Salgadin.Models;

namespace Salgadin.Services
{
    public interface IIncomeService
    {
        Task<IncomeDto?> GetIncomeByIdAsync(int id);
        Task<PagedResult<IncomeDto>> GetPagedAsync(
            int pageNumber,
            int pageSize,
            DateTime? startDate = null,
            DateTime? endDate = null,
            bool? isFixed = null);
        Task<IncomeDto> AddIncomeAsync(CreateIncomeDto incomeDto);
        Task UpdateIncomeAsync(int id, UpdateIncomeDto incomeDto);
        Task DeleteIncomeAsync(int id);
    }
}
