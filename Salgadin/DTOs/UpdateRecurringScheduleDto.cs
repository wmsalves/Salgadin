using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class UpdateRecurringScheduleDto
    {
        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public int? CategoryId { get; set; }
        public int? SubcategoryId { get; set; }

        public string Frequency { get; set; } = "Monthly";

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Range(1, 31)]
        public int DayOfMonth { get; set; }

        public string Status { get; set; } = "Active";
    }
}
