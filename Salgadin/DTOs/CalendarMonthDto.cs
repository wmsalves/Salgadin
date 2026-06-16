namespace Salgadin.DTOs
{
    public class CalendarMonthDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PredictedIncome { get; set; }
        public decimal PredictedExpense { get; set; }
        public decimal PredictedBalance { get; set; }
        public List<CalendarDayDto> Days { get; set; } = [];
    }

    public class CalendarDayDto
    {
        public DateTime Date { get; set; }
        public decimal IncomeTotal { get; set; }
        public decimal ExpenseTotal { get; set; }
        public decimal Balance { get; set; }
        public List<CalendarEntryDto> Incomes { get; set; } = [];
        public List<CalendarEntryDto> Expenses { get; set; } = [];
        public List<CalendarRecurringItemDto> Recurrences { get; set; } = [];
    }

    public class CalendarEntryDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Category { get; set; }
        public string? Subcategory { get; set; }
        public bool IsRecurring { get; set; }
        public int? RecurringScheduleId { get; set; }
    }

    public class CalendarRecurringItemDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Category { get; set; }
        public string? Subcategory { get; set; }
        public DateTime OccurrenceDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
