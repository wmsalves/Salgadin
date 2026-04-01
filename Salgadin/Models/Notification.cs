namespace Salgadin.Models
{
    public class Notification : IEntity
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int? GoalId { get; set; }
        public BudgetGoal? Goal { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public string Type { get; set; } = "goal_threshold";
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }

        public int PeriodYear { get; set; }
        public int PeriodMonth { get; set; }

        public decimal MonthlyLimit { get; set; }
        public decimal Spent { get; set; }
        public decimal Threshold { get; set; }
    }
}
