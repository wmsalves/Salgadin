namespace Salgadin.DTOs
{
    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public int? SubcategoryId { get; set; }
        public string? Subcategory { get; set; }
        public DateTime Date { get; set; }
    }
}
