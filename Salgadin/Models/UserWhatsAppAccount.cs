namespace Salgadin.Models;

public class UserWhatsAppAccount : IEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? WhatsAppId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
