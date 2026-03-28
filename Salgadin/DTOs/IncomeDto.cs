namespace Salgadin.DTOs
{
    public class IncomeDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public bool IsFixed { get; set; }
    }
}
