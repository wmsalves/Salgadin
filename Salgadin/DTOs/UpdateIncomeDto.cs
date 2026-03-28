namespace Salgadin.DTOs
{
    public class UpdateIncomeDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public bool IsFixed { get; set; }
    }
}
