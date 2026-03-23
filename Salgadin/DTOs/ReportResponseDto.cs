namespace Salgadin.DTOs
{
    public class ReportResponseDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Total { get; set; }
        public IEnumerable<ReportPointDto> Series { get; set; } = Array.Empty<ReportPointDto>();
        public IEnumerable<CategoryTotalDto> ByCategory { get; set; } = Array.Empty<CategoryTotalDto>();
    }
}
