namespace Salgadin.Services
{
    public interface IExportService
    {
        Task<(byte[] Content, string ContentType, string FileName)> ExportExpensesAsync(
            string format,
            DateTime? startDate,
            DateTime? endDate,
            string? category,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount);
    }
}
