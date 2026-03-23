using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Salgadin.Exceptions;
using Salgadin.Repositories;
using System.Globalization;
using System.Text;

namespace Salgadin.Services
{
    public class ExportService : IExportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;

        public ExportService(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }

        public async Task<(byte[] Content, string ContentType, string FileName)> ExportExpensesAsync(
            string format,
            DateTime? startDate,
            DateTime? endDate,
            string? category)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            if (startDate.HasValue)
                query = query.Where(e => e.Date.Date >= startDate.Value.Date);
            if (endDate.HasValue)
                query = query.Where(e => e.Date.Date <= endDate.Value.Date);
            if (!string.IsNullOrWhiteSpace(category))
            {
                var categoryLower = category.Trim().ToLower();
                query = query.Where(e => e.Category != null && e.Category.Name.ToLower() == categoryLower);
            }

            var expenses = await query
                .Include(e => e.Category)
                .Include(e => e.Subcategory)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            var safeFormat = format?.Trim().ToLowerInvariant();
            if (safeFormat == "csv")
            {
                var content = BuildCsv(expenses);
                var fileName = $"expenses-{DateTime.UtcNow:yyyyMMdd}.csv";
                return (content, "text/csv", fileName);
            }

            if (safeFormat == "pdf")
            {
                var content = BuildPdf(expenses, startDate, endDate, category);
                var fileName = $"expenses-{DateTime.UtcNow:yyyyMMdd}.pdf";
                return (content, "application/pdf", fileName);
            }

            throw new BadInputException("Formato inválido. Use 'csv' ou 'pdf'.");
        }

        private static byte[] BuildCsv(IEnumerable<Models.Expense> expenses)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Date,Description,Amount,Category,Subcategory");

            foreach (var e in expenses)
            {
                var line = string.Join(",",
                    EscapeCsv(e.Date.ToString("yyyy-MM-dd")),
                    EscapeCsv(e.Description),
                    e.Amount.ToString(CultureInfo.InvariantCulture),
                    EscapeCsv(e.Category?.Name ?? string.Empty),
                    EscapeCsv(e.Subcategory?.Name ?? string.Empty)
                );
                sb.AppendLine(line);
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private static byte[] BuildPdf(
            IEnumerable<Models.Expense> expenses,
            DateTime? startDate,
            DateTime? endDate,
            string? category)
        {
            var expensesList = expenses.ToList();
            var total = expensesList.Sum(e => e.Amount);

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(24);
                    page.Size(PageSizes.A4);

                    page.Header().Column(header =>
                    {
                        header.Item().Text("Salgadin - Exportação de Despesas")
                            .FontSize(16)
                            .SemiBold();

                        var filters = $"Período: {FormatDate(startDate)} a {FormatDate(endDate)}";
                        if (!string.IsNullOrWhiteSpace(category))
                        {
                            filters += $" | Categoria: {category}";
                        }

                        header.Item().Text(filters).FontSize(10).FontColor(Colors.Grey.Darken2);
                        header.Item().Text($"Total: {total:C2}").FontSize(10);
                    });

                    page.Content().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(80);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Data");
                            header.Cell().Element(HeaderCell).Text("Descrição");
                            header.Cell().Element(HeaderCell).Text("Valor");
                            header.Cell().Element(HeaderCell).Text("Categoria");
                            header.Cell().Element(HeaderCell).Text("Subcategoria");
                        });

                        foreach (var e in expensesList)
                        {
                            table.Cell().Element(BodyCell).Text(e.Date.ToString("yyyy-MM-dd"));
                            table.Cell().Element(BodyCell).Text(e.Description);
                            table.Cell().Element(BodyCell).Text(e.Amount.ToString("C2"));
                            table.Cell().Element(BodyCell).Text(e.Category?.Name ?? string.Empty);
                            table.Cell().Element(BodyCell).Text(e.Subcategory?.Name ?? string.Empty);
                        }
                    });

                    page.Footer().AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Página ");
                            x.CurrentPageNumber();
                            x.Span(" de ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        private static IContainer HeaderCell(IContainer container)
        {
            return container
                .DefaultTextStyle(x => x.SemiBold())
                .PaddingVertical(4)
                .Background(Colors.Grey.Lighten3)
                .BorderBottom(1)
                .BorderColor(Colors.Grey.Lighten1)
                .AlignLeft();
        }

        private static IContainer BodyCell(IContainer container)
        {
            return container
                .PaddingVertical(3)
                .BorderBottom(1)
                .BorderColor(Colors.Grey.Lighten4)
                .AlignLeft();
        }

        private static string EscapeCsv(string value)
        {
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }

            return value;
        }

        private static string FormatDate(DateTime? date)
        {
            return date.HasValue ? date.Value.ToString("yyyy-MM-dd") : "N/A";
        }
    }
}
