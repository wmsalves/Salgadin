namespace Salgadin.DTOs
{
    public class GoalAlertDto
    {
        public int GoalId { get; set; }
        public int? CategoryId { get; set; }
        public string? Category { get; set; }
        public decimal MonthlyLimit { get; set; }
        public decimal AlertThreshold { get; set; }
        public decimal Spent { get; set; }
        public bool ThresholdReached { get; set; }
    }
}
