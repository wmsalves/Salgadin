namespace Salgadin.Models;

public class WhatsAppProcessedMessage : IEntity
{
    public int Id { get; set; }
    public string ProviderMessageId { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User? User { get; set; }
    public DateTime ProcessedAt { get; set; }
}
