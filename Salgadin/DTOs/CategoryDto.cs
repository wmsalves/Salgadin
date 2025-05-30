using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class CategoryDto
    {
        [Required(ErrorMessage = "O campo CategoryId é obrigatório.")]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}