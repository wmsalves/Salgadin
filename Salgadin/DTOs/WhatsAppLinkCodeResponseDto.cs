namespace Salgadin.DTOs;

public class WhatsAppLinkCodeResponseDto
{
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
