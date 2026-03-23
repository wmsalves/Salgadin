namespace Salgadin.DTOs
{
    public class NotificationPreferenceDto
    {
        public bool EmailEnabled { get; set; }
        public bool PushEnabled { get; set; }
        public decimal MinimumThreshold { get; set; }
    }
}
