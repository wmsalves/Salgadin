using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface INotificationService
    {
        Task<NotificationPreferenceDto> GetPreferencesAsync();
        Task<NotificationPreferenceDto> UpsertPreferencesAsync(UpdateNotificationPreferenceDto dto);
        Task<IEnumerable<GoalAlertDto>> GetAlertsAsync(int year, int month);
        Task<IEnumerable<NotificationDto>> GetNotificationsAsync(bool unreadOnly = false);
        Task MarkAsReadAsync(int id);
        Task<int> MarkAllAsReadAsync();
        Task<IEnumerable<NotificationDto>> GenerateGoalNotificationsAsync(DateTime referenceDateUtc);
    }
}
