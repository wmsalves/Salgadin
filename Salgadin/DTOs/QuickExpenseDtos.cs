using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class QuickExpenseRequestDto
    {
        /// <summary>Texto livre, ex.: "cafe 7,50" ou "uber 23,40 ontem".</summary>
        [Required(ErrorMessage = "Escreva o gasto, por exemplo: café 7,50.")]
        [StringLength(120, ErrorMessage = "O texto deve ter no máximo 120 caracteres.")]
        public string Text { get; set; } = string.Empty;

        /// <summary>Data de "hoje" no fuso do usuário (AAAA-MM-DD). Opcional.</summary>
        public DateTime? Today { get; set; }
    }

    public class FrequentExpenseDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int CategoryId { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
