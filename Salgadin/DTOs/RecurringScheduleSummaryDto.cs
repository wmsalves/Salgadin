namespace Salgadin.DTOs
{
    public class RecurringScheduleSummaryDto
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Paused { get; set; }
        public int Due { get; set; }
        public DateTime? NextOccurrenceDate { get; set; }
        public DateTime? LastGenerationDate { get; set; }
    }
}
