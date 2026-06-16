using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface ICalendarService
    {
        Task<CalendarMonthDto> GetMonthAsync(int? year, int? month);
    }
}
