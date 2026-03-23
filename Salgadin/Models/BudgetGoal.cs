namespace Salgadin.Models
{
    public class BudgetGoal : IEntity
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public decimal MonthlyLimit { get; set; }
        public decimal AlertThreshold { get; set; } // 0.0 a 1.0 (percentual do limite)
        public bool IsActive { get; set; } = true;
    }
}
