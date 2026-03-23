namespace Salgadin.Services
{
    public interface IExportService
    {
        Task<(byte[] Content, string ContentType, string FileName)> ExportExpensesAsync(
            string format,
            DateTime? startDate,
            DateTime? endDate,
            string? category);
    }
}
