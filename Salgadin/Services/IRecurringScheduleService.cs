using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface IRecurringScheduleService
    {
        Task<IEnumerable<RecurringScheduleDto>> GetAllAsync();
        Task<RecurringScheduleSummaryDto> GetSummaryAsync();
        Task<RecurringScheduleDto?> GetByIdAsync(int id);
        Task<RecurringScheduleDto> CreateAsync(CreateRecurringScheduleDto dto);
        Task<RecurringScheduleDto?> UpdateAsync(int id, UpdateRecurringScheduleDto dto);
        Task<RecurringScheduleDto?> PauseAsync(int id);
        Task<RecurringScheduleDto?> ResumeAsync(int id);
        Task ArchiveAsync(int id);
        Task<GenerateRecurringSchedulesResultDto> GenerateDueAsync(int userId, DateTime untilDate);
        Task<GenerateRecurringSchedulesResultDto> GenerateDueForCurrentUserAsync(DateTime? untilDate);
    }
}
