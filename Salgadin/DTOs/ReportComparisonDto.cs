namespace Salgadin.DTOs
{
    public class ReportComparisonDto
    {
        public ReportResponseDto Current { get; set; } = new();
        public ReportResponseDto Previous { get; set; } = new();
        public decimal DeltaTotal { get; set; }
        public decimal DeltaPercent { get; set; }
    }
}
