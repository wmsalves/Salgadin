using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class CreateExpenseDto
    {
        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(100, ErrorMessage = "A descrição deve ter no máximo 100 caracteres.")]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "O campo CategoryId é obrigatório.")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "A data é obrigatória.")]
        public DateTime Date { get; set; }
    }
}
