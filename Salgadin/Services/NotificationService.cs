using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class NotificationService : INotificationService
    {
        private const string GoalThresholdType = "goal_threshold";
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        private readonly IGoalService _goalService;

        public NotificationService(IUnitOfWork unitOfWork, IUserContextService userContext, IGoalService goalService)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _goalService = goalService;
        }

        public async Task<NotificationPreferenceDto> GetPreferencesAsync()
        {
            var userId = _userContext.GetUserId();
            var pref = await _unitOfWork.NotificationPreferences.GetQueryable()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (pref == null)
            {
                return new NotificationPreferenceDto
                {
                    EmailEnabled = false,
                    PushEnabled = false,
                    MinimumThreshold = 0
                };
            }

            return new NotificationPreferenceDto
            {
                EmailEnabled = pref.EmailEnabled,
                PushEnabled = pref.PushEnabled,
                MinimumThreshold = pref.MinimumThreshold
            };
        }

        public async Task<NotificationPreferenceDto> UpsertPreferencesAsync(UpdateNotificationPreferenceDto dto)
        {
            var userId = _userContext.GetUserId();
            var pref = await _unitOfWork.NotificationPreferences.GetQueryable()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (pref == null)
            {
                pref = new NotificationPreference
                {
                    UserId = userId
                };
                await _unitOfWork.NotificationPreferences.AddAsync(pref);
            }

            pref.EmailEnabled = dto.EmailEnabled;
            pref.PushEnabled = dto.PushEnabled;
            pref.MinimumThreshold = dto.MinimumThreshold;

            _unitOfWork.NotificationPreferences.Update(pref);
            await _unitOfWork.CompleteAsync();

            return new NotificationPreferenceDto
            {
                EmailEnabled = pref.EmailEnabled,
                PushEnabled = pref.PushEnabled,
                MinimumThreshold = pref.MinimumThreshold
            };
        }

        public async Task<IEnumerable<GoalAlertDto>> GetAlertsAsync(int year, int month)
        {
            var pref = await GetPreferencesAsync();
            var alerts = await _goalService.GetAlertsAsync(year, month);

            var minThreshold = pref.MinimumThreshold;
            if (minThreshold <= 0)
            {
                return alerts;
            }

            return alerts.Where(a =>
            {
                if (a.MonthlyLimit <= 0)
                {
                    return false;
                }

                var ratio = a.Spent / a.MonthlyLimit;
                return ratio >= minThreshold;
            });
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsAsync(bool unreadOnly = false)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Notifications.GetQueryable()
                .Where(n => n.UserId == userId);

            if (unreadOnly)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .Include(n => n.Category)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications.Select(MapNotification);
        }

        public async Task MarkAsReadAsync(int id)
        {
            var userId = _userContext.GetUserId();
            var notification = await _unitOfWork.Notifications.GetQueryable()
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
            {
                return;
            }

            notification.IsRead = true;
            _unitOfWork.Notifications.Update(notification);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<int> MarkAllAsReadAsync()
        {
            var userId = _userContext.GetUserId();
            var unread = await _unitOfWork.Notifications.GetQueryable()
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (unread.Count == 0)
            {
                return 0;
            }

            foreach (var notification in unread)
            {
                notification.IsRead = true;
            }

            await _unitOfWork.CompleteAsync();
            return unread.Count;
        }

        public async Task<IEnumerable<NotificationDto>> GenerateGoalNotificationsAsync(DateTime referenceDateUtc)
        {
            var userId = _userContext.GetUserId();
            var year = referenceDateUtc.Year;
            var month = referenceDateUtc.Month;

            var alerts = (await GetAlertsAsync(year, month))
                .Where(a => a.ThresholdReached && a.MonthlyLimit > 0)
                .ToList();

            if (alerts.Count == 0)
            {
                return Enumerable.Empty<NotificationDto>();
            }

            var existingGoalIds = await _unitOfWork.Notifications.GetQueryable()
                .Where(n => n.UserId == userId
                            && n.Type == GoalThresholdType
                            && n.PeriodYear == year
                            && n.PeriodMonth == month
                            && n.GoalId != null)
                .Select(n => n.GoalId!.Value)
                .ToListAsync();

            var created = new List<Notification>();

            foreach (var alert in alerts)
            {
                if (existingGoalIds.Contains(alert.GoalId))
                {
                    continue;
                }

                var title = alert.Category != null
                    ? $"Meta de {alert.Category} atingiu {alert.AlertThreshold:P0}"
                    : $"Meta geral atingiu {alert.AlertThreshold:P0}";

                var message =
                    $"Voce ja gastou R$ {alert.Spent:N2} de R$ {alert.MonthlyLimit:N2} neste mes.";

                var notification = new Notification
                {
                    UserId = userId,
                    GoalId = alert.GoalId,
                    CategoryId = alert.CategoryId,
                    Type = GoalThresholdType,
                    Title = title,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    PeriodYear = year,
                    PeriodMonth = month,
                    MonthlyLimit = alert.MonthlyLimit,
                    Spent = alert.Spent,
                    Threshold = alert.AlertThreshold
                };

                created.Add(notification);
                await _unitOfWork.Notifications.AddAsync(notification);
            }

            if (created.Count == 0)
            {
                return Enumerable.Empty<NotificationDto>();
            }

            await _unitOfWork.CompleteAsync();

            return created.Select(MapNotification);
        }

        private static NotificationDto MapNotification(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                GoalId = notification.GoalId,
                CategoryId = notification.CategoryId,
                Category = notification.Category?.Name,
                MonthlyLimit = notification.MonthlyLimit,
                Spent = notification.Spent,
                Threshold = notification.Threshold,
                PeriodYear = notification.PeriodYear,
                PeriodMonth = notification.PeriodMonth
            };
        }
    }
}
