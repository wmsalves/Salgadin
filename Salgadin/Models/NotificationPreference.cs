namespace Salgadin.Models
{
    public class NotificationPreference : IEntity
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public bool EmailEnabled { get; set; }
        public bool PushEnabled { get; set; }

        // Limiar mínimo global (0-1). Se 0, usa somente o limiar da meta.
        public decimal MinimumThreshold { get; set; }
    }
}
