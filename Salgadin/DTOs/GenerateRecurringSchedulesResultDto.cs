namespace Salgadin.DTOs
{
    public class GenerateRecurringSchedulesResultDto
    {
        public int GeneratedIncomes { get; set; }
        public int GeneratedExpenses { get; set; }
        public int SkippedDuplicates { get; set; }
        public int FinishedSchedules { get; set; }
        public DateTime UntilDate { get; set; }
    }
}
