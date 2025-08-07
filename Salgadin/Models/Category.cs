using Salgadin.Models;
using System.ComponentModel.DataAnnotations;

public class Category
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Name { get; set; } = string.Empty;

    public ICollection<Expense>? Expenses { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }
}
