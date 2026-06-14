namespace Salgadin.Models
{
    public class Income : IEntity
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public bool IsFixed { get; set; }
        public int? RecurringScheduleId { get; set; }
        public RecurringSchedule? RecurringSchedule { get; set; }
        public int? RecurringPeriodYear { get; set; }
        public int? RecurringPeriodMonth { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
