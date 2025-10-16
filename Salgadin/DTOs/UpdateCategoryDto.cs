using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class UpdateCategoryDto
    {
        [Required(ErrorMessage = "O nome da categoria é obrigatório.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 50 caracteres.")]
        public string Name { get; set; } = string.Empty;
    }
}