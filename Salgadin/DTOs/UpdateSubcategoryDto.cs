using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class UpdateSubcategoryDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Name { get; set; } = string.Empty;
    }
}
