namespace Salgadin.DTOs
{
    public class GoalDto
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string? Category { get; set; }
        public decimal MonthlyLimit { get; set; }
        public decimal AlertThreshold { get; set; }
        public bool IsActive { get; set; }
    }
}
