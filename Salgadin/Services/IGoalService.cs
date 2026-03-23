using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface IGoalService
    {
        Task<IEnumerable<GoalDto>> GetAllAsync();
        Task<GoalDto?> GetByIdAsync(int id);
        Task<GoalDto> CreateAsync(CreateGoalDto dto);
        Task<GoalDto?> UpdateAsync(int id, UpdateGoalDto dto);
        Task DeleteAsync(int id);
        Task<IEnumerable<GoalAlertDto>> GetAlertsAsync(int year, int month);
    }
}
