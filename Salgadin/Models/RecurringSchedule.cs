namespace Salgadin.Models
{
    public class RecurringSchedule : IEntity
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public RecurringScheduleType Type { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public int? SubcategoryId { get; set; }
        public Subcategory? Subcategory { get; set; }

        public RecurringScheduleFrequency Frequency { get; set; } = RecurringScheduleFrequency.Monthly;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int DayOfMonth { get; set; }
        public DateTime NextOccurrenceDate { get; set; }
        public DateTime? LastGeneratedOccurrenceDate { get; set; }

        public RecurringScheduleStatus Status { get; set; } = RecurringScheduleStatus.Active;
        public RecurringScheduleSource Source { get; set; } = RecurringScheduleSource.Manual;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
