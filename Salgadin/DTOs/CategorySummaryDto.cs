namespace Salgadin.DTOs
{
    public class CategorySummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Spent { get; set; }
        public decimal Limit { get; set; }
    }
}
