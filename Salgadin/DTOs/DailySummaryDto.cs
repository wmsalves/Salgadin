namespace Salgadin.DTOs
{
    public class DailySummaryDto
    {
        public DateTime Date { get; set; }
        public decimal Total { get; set; }
        public Dictionary<string, decimal> TotalByCategory { get; set; } = new();
    }
}