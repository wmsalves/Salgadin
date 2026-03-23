using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class CreateGoalDto
    {
        public int? CategoryId { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "O limite mensal deve ser maior que zero.")]
        public decimal MonthlyLimit { get; set; }

        [Range(0.01, 1.0, ErrorMessage = "O limiar deve ser entre 0,01 e 1,00.")]
        public decimal AlertThreshold { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
