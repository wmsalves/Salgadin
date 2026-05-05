namespace Salgadin.Models;

public class WhatsAppLinkCode : IEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
