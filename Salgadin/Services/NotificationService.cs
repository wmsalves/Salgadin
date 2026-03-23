using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class NotificationService : INotificationService
    {
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
    }
}
