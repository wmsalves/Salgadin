using System.ComponentModel.DataAnnotations;

namespace Salgadin.DTOs;

public class SimulateWhatsAppMessageRequestDto
{
    [Required]
    public string From { get; set; } = string.Empty;

    [Required]
    public string Text { get; set; } = string.Empty;

    [Required]
    public string MessageId { get; set; } = string.Empty;
}
