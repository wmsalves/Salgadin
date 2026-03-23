using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs
{
    public class UpdateNotificationPreferenceDto
    {
        public bool EmailEnabled { get; set; }
        public bool PushEnabled { get; set; }

        [Range(0, 1, ErrorMessage = "O limiar mínimo deve estar entre 0 e 1.")]
        public decimal MinimumThreshold { get; set; }
    }
}
