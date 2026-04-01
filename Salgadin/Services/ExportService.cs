using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Salgadin.DTOs;
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
            string? category,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            var userId = _userContext.GetUserId();
            var query = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId);

            if (startDate.HasValue || endDate.HasValue)
            {
                var startUtc = startDate.HasValue
                    ? DateTime.SpecifyKind(startDate.Value.Date, DateTimeKind.Utc)
                    : DateTime.SpecifyKind(DateTime.MinValue, DateTimeKind.Utc);
                var endExclusiveUtc = endDate.HasValue
                    ? DateTime.SpecifyKind(endDate.Value.Date.AddDays(1), DateTimeKind.Utc)
                    : DateTime.SpecifyKind(DateTime.MaxValue, DateTimeKind.Utc);

                query = query.Where(e => e.Date >= startUtc && e.Date < endExclusiveUtc);
            }

            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(category))
            {
                var categoryLower = category.Trim().ToLower();
                query = query.Where(e => e.Category != null && e.Category.Name.ToLower() == categoryLower);
            }

            if (subcategoryId.HasValue)
            {
                query = query.Where(e => e.SubcategoryId == subcategoryId.Value);
            }

            if (minAmount.HasValue)
            {
                query = query.Where(e => e.Amount >= minAmount.Value);
            }

            if (maxAmount.HasValue)
            {
                query = query.Where(e => e.Amount <= maxAmount.Value);
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
                var summary = await BuildSummaryAsync(
                    userId,
                    expenses,
                    startDate,
                    endDate,
                    categoryId,
                    subcategoryId,
                    minAmount,
                    maxAmount);
                var content = BuildPdf(
                    expenses,
                    startDate,
                    endDate,
                    category,
                    categoryId,
                    subcategoryId,
                    minAmount,
                    maxAmount,
                    summary);
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
            string? category,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount,
            ReportSummaryDto? summary)
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
                        if (categoryId.HasValue)
                        {
                            filters += $" | Categoria ID: {categoryId}";
                        }
                        if (subcategoryId.HasValue)
                        {
                            filters += $" | Subcategoria ID: {subcategoryId}";
                        }
                        if (minAmount.HasValue)
                        {
                            filters += $" | Min: {minAmount.Value:C2}";
                        }
                        if (maxAmount.HasValue)
                        {
                            filters += $" | Max: {maxAmount.Value:C2}";
                        }

                        header.Item().Text(filters).FontSize(10).FontColor(Colors.Grey.Darken2);
                        header.Item().Text($"Total: {total:C2}").FontSize(10);
                    });

                    page.Content().PaddingTop(10).Column(column =>
                    {
                        if (summary != null)
                        {
                            column.Item().Text("Resumo executivo")
                                .FontSize(12)
                                .SemiBold();

                            column.Item().PaddingTop(4).Row(row =>
                            {
                                row.RelativeItem().Text($"Total: {summary.Total:C2}");
                                row.RelativeItem().Text($"Média diária: {summary.AverageDaily:C2}");
                            });
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Text($"Maior dia: {summary.BiggestDay ?? "N/A"}");
                                row.RelativeItem().Text($"Valor pico: {summary.BiggestDayTotal:C2}");
                            });
                            column.Item().Text($"Tendência: {(summary.TrendPercent * 100):N1}%")
                                .FontColor(summary.TrendPercent >= 0 ? Colors.Red.Medium : Colors.Green.Darken2);

                            if (summary.TopCategories.Count > 0)
                            {
                                var topText = string.Join(" | ",
                                    summary.TopCategories.Select(c => $"{c.Category}: {c.Total:C2}"));
                                column.Item().Text($"Top categorias: {topText}")
                                    .FontSize(10)
                                    .FontColor(Colors.Grey.Darken2);
                            }

                            if (summary.Insights.Count > 0)
                            {
                                column.Item().PaddingTop(6).Text("Insights")
                                    .FontSize(11)
                                    .SemiBold();
                                foreach (var insight in summary.Insights)
                                {
                                    column.Item().Text($"- {insight.Detail}")
                                        .FontSize(10)
                                        .FontColor(Colors.Grey.Darken2);
                                }
                            }
                        }

                        column.Item().PaddingTop(10).Table(table =>
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

        private async Task<ReportSummaryDto?> BuildSummaryAsync(
            int userId,
            IEnumerable<Models.Expense> expenses,
            DateTime? startDate,
            DateTime? endDate,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            var expensesList = expenses.ToList();
            if (expensesList.Count == 0)
            {
                return null;
            }

            var start = startDate?.Date ?? expensesList.Min(e => e.Date.Date);
            var end = endDate?.Date ?? expensesList.Max(e => e.Date.Date);

            var series = expensesList
                .GroupBy(e => e.Date.Date)
                .Select(g => new { Date = g.Key, Total = g.Sum(x => x.Amount) })
                .ToList();

            var total = series.Sum(x => x.Total);
            var averageDaily = series.Count == 0 ? 0 : total / series.Count;
            var biggest = series.OrderByDescending(x => x.Total).FirstOrDefault();

            var topCategories = expensesList
                .GroupBy(e => e.Category?.Name ?? "Sem Categoria")
                .Select(g => new CategoryTotalDto
                {
                    Category = g.Key,
                    Total = g.Sum(x => x.Amount)
                })
                .OrderByDescending(x => x.Total)
                .Take(3)
                .ToList();

            var periodDays = (end - start).Days + 1;
            var previousEnd = start.AddDays(-1);
            var previousStart = previousEnd.AddDays(-(periodDays - 1));
            var previousStartUtc = DateTime.SpecifyKind(previousStart, DateTimeKind.Utc);
            var previousEndExclusive = DateTime.SpecifyKind(previousEnd.AddDays(1), DateTimeKind.Utc);

            var previousQuery = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId && e.Date >= previousStartUtc && e.Date < previousEndExclusive);
            previousQuery = ApplyFilters(previousQuery, categoryId, subcategoryId, minAmount, maxAmount);
            var previousTotal = await previousQuery.SumAsync(x => x.Amount);

            var trendPercent = previousTotal == 0 ? 0 : (total - previousTotal) / previousTotal;

            var insights = new List<ReportInsightDto>();
            if (previousTotal > 0)
            {
                var direction = trendPercent >= 0 ? "subiram" : "cairam";
                var tone = trendPercent >= 0 ? "negative" : "positive";
                insights.Add(new ReportInsightDto
                {
                    Title = "Comparativo com periodo anterior",
                    Detail = $"Seus gastos {direction} {(Math.Abs(trendPercent) * 100):N1}% no mesmo intervalo.",
                    Tone = tone
                });
            }

            if (topCategories.Count > 0)
            {
                var top = topCategories[0];
                insights.Add(new ReportInsightDto
                {
                    Title = "Categoria dominante",
                    Detail = $"{top.Category} representa R$ {top.Total:N2} do periodo.",
                    Tone = "neutral"
                });
            }

            if (biggest != null)
            {
                insights.Add(new ReportInsightDto
                {
                    Title = "Pico de gastos",
                    Detail = $"O maior gasto aconteceu em {biggest.Date:dd/MM} com R$ {biggest.Total:N2}.",
                    Tone = "neutral"
                });
            }

            return new ReportSummaryDto
            {
                StartDate = DateTime.SpecifyKind(start, DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(end, DateTimeKind.Utc),
                Total = total,
                AverageDaily = averageDaily,
                BiggestDay = biggest?.Date.ToString("yyyy-MM-dd"),
                BiggestDayTotal = biggest?.Total ?? 0,
                TrendPercent = trendPercent,
                TopCategories = topCategories,
                Insights = insights
            };
        }

        private static IQueryable<Models.Expense> ApplyFilters(
            IQueryable<Models.Expense> query,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            if (subcategoryId.HasValue)
            {
                query = query.Where(e => e.SubcategoryId == subcategoryId.Value);
            }

            if (minAmount.HasValue)
            {
                query = query.Where(e => e.Amount >= minAmount.Value);
            }

            if (maxAmount.HasValue)
            {
                query = query.Where(e => e.Amount <= maxAmount.Value);
            }

            return query;
        }
    }
}
