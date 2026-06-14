namespace Salgadin.DTOs
{
    public class RecurringScheduleDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int? CategoryId { get; set; }
        public string? Category { get; set; }
        public int? SubcategoryId { get; set; }
        public string? Subcategory { get; set; }
        public string Frequency { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int DayOfMonth { get; set; }
        public DateTime NextOccurrenceDate { get; set; }
        public DateTime? LastGeneratedOccurrenceDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
