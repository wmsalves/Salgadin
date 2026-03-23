using System.ComponentModel.DataAnnotations;

namespace Salgadin.Models
{
    public class Category : IEntity
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Name { get; set; } = string.Empty;

        public ICollection<Expense>? Expenses { get; set; }
        public ICollection<Subcategory>? Subcategories { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
