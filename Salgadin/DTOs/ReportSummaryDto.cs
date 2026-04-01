namespace Salgadin.DTOs
{
    public class ReportSummaryDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Total { get; set; }
        public decimal AverageDaily { get; set; }
        public string? BiggestDay { get; set; }
        public decimal BiggestDayTotal { get; set; }
        public decimal TrendPercent { get; set; }
        public List<CategoryTotalDto> TopCategories { get; set; } = new();
        public List<ReportInsightDto> Insights { get; set; } = new();
    }
}
