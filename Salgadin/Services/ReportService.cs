using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;

        public ReportService(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }

        public async Task<ReportResponseDto> GetMonthlyAsync(
            int year,
            int month,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            if (month < 1 || month > 12)
            {
                throw new BadInputException("Mês inválido.");
            }

            var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endExclusive = start.AddMonths(1);

            return await BuildReportAsync(start, endExclusive, categoryId, subcategoryId, minAmount, maxAmount);
        }

        public async Task<ReportResponseDto> GetWeeklyAsync(
            DateTime startDate,
            DateTime endDate,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            var start = startDate.Date;
            var end = endDate.Date;

            if (end < start)
            {
                throw new BadInputException("A data final não pode ser menor que a data inicial.");
            }

            var startUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            var endExclusive = DateTime.SpecifyKind(end.AddDays(1), DateTimeKind.Utc);

            return await BuildReportAsync(startUtc, endExclusive, categoryId, subcategoryId, minAmount, maxAmount);
        }

        public async Task<ReportComparisonDto> CompareMonthlyAsync(
            int year,
            int month,
            int compareYear,
            int compareMonth,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            if (month < 1 || month > 12 || compareMonth < 1 || compareMonth > 12)
            {
                throw new BadInputException("Mês inválido.");
            }

            var currentStart = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var currentEnd = currentStart.AddMonths(1);
            var previousStart = new DateTime(compareYear, compareMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var previousEnd = previousStart.AddMonths(1);

            var current = await BuildReportAsync(currentStart, currentEnd, categoryId, subcategoryId, minAmount, maxAmount);
            var previous = await BuildReportAsync(previousStart, previousEnd, categoryId, subcategoryId, minAmount, maxAmount);

            var delta = current.Total - previous.Total;
            var deltaPercent = previous.Total == 0 ? 0 : delta / previous.Total;

            return new ReportComparisonDto
            {
                Current = current,
                Previous = previous,
                DeltaTotal = delta,
                DeltaPercent = deltaPercent
            };
        }

        public async Task<ReportSummaryDto> GetSummaryAsync(
            DateTime startDate,
            DateTime endDate,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            var start = startDate.Date;
            var end = endDate.Date;

            if (end < start)
            {
                throw new BadInputException("A data final não pode ser menor que a data inicial.");
            }

            var startUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            var endExclusive = DateTime.SpecifyKind(end.AddDays(1), DateTimeKind.Utc);

            var userId = _userContext.GetUserId();
            var baseQuery = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId && e.Date >= startUtc && e.Date < endExclusive);
            baseQuery = ApplyFilters(baseQuery, categoryId, subcategoryId, minAmount, maxAmount);

            var series = await baseQuery
                .GroupBy(e => e.Date.Date)
                .Select(g => new { Date = g.Key, Total = g.Sum(x => x.Amount) })
                .ToListAsync();

            var total = series.Sum(x => x.Total);
            var averageDaily = series.Count == 0 ? 0 : total / series.Count;
            var biggest = series.OrderByDescending(x => x.Total).FirstOrDefault();

            var topCategories = await baseQuery
                .GroupBy(e => e.Category != null ? e.Category.Name : "Sem Categoria")
                .Select(g => new CategoryTotalDto
                {
                    Category = g.Key,
                    Total = g.Sum(x => x.Amount)
                })
                .OrderByDescending(x => x.Total)
                .Take(3)
                .ToListAsync();

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
                StartDate = startUtc,
                EndDate = endExclusive.AddDays(-1),
                Total = total,
                AverageDaily = averageDaily,
                BiggestDay = biggest?.Date.ToString("yyyy-MM-dd"),
                BiggestDayTotal = biggest?.Total ?? 0,
                TrendPercent = trendPercent,
                TopCategories = topCategories,
                Insights = insights
            };
        }

        private async Task<ReportResponseDto> BuildReportAsync(
            DateTime startUtc,
            DateTime endExclusiveUtc,
            int? categoryId,
            int? subcategoryId,
            decimal? minAmount,
            decimal? maxAmount)
        {
            var userId = _userContext.GetUserId();

            var baseQuery = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId && e.Date >= startUtc && e.Date < endExclusiveUtc);

            baseQuery = ApplyFilters(baseQuery, categoryId, subcategoryId, minAmount, maxAmount);

            var series = await baseQuery
                .GroupBy(e => e.Date.Date)
                .Select(g => new ReportPointDto
                {
                    Date = g.Key,
                    Total = g.Sum(x => x.Amount)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var byCategory = await baseQuery
                .GroupBy(e => e.Category != null ? e.Category.Name : "Sem Categoria")
                .Select(g => new CategoryTotalDto
                {
                    Category = g.Key,
                    Total = g.Sum(x => x.Amount)
                })
                .OrderByDescending(x => x.Total)
                .ToListAsync();

            var total = await baseQuery.SumAsync(x => x.Amount);

            return new ReportResponseDto
            {
                StartDate = startUtc,
                EndDate = endExclusiveUtc.AddDays(-1),
                Total = total,
                Series = series,
                ByCategory = byCategory
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
