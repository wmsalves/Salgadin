namespace Salgadin.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? GoalId { get; set; }
        public int? CategoryId { get; set; }
        public string? Category { get; set; }
        public decimal MonthlyLimit { get; set; }
        public decimal Spent { get; set; }
        public decimal Threshold { get; set; }
        public int PeriodYear { get; set; }
        public int PeriodMonth { get; set; }
    }
}
