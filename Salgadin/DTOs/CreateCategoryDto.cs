using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class CreateCategoryDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
    }
}