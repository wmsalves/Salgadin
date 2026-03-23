using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface IReportService
    {
        Task<ReportResponseDto> GetMonthlyAsync(int year, int month);
        Task<ReportResponseDto> GetWeeklyAsync(DateTime startDate, DateTime endDate);
    }
}
