using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface IReportService
    {
        Task<ReportResponseDto> GetMonthlyAsync(
            int year,
            int month,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount);
        Task<ReportResponseDto> GetWeeklyAsync(
            DateTime startDate,
            DateTime endDate,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount);
        Task<ReportComparisonDto> CompareMonthlyAsync(
            int year,
            int month,
            int compareYear,
            int compareMonth,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount);
        Task<ReportSummaryDto> GetSummaryAsync(
            DateTime startDate,
            DateTime endDate,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount);
    }
}
