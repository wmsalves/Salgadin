using System.ComponentModel.DataAnnotations;

namespace Salgadin.Models
{
    public class Category
    {
        [Required(ErrorMessage = "O campo CategoryId é obrigatório.")]
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Expense>? Expenses { get; set; }
    }
}
