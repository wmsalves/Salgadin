namespace Salgadin.Services
{
    internal static class DateOnlyNormalizer
    {
        public static DateTime Normalize(DateTime value)
        {
            return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
        }
    }
}
