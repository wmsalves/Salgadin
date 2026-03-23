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

        public async Task<ReportResponseDto> GetMonthlyAsync(int year, int month)
        {
            if (month < 1 || month > 12)
            {
                throw new BadInputException("Mês inválido.");
            }

            var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endExclusive = start.AddMonths(1);

            return await BuildReportAsync(start, endExclusive);
        }

        public async Task<ReportResponseDto> GetWeeklyAsync(DateTime startDate, DateTime endDate)
        {
            var start = startDate.Date;
            var end = endDate.Date;

            if (end < start)
            {
                throw new BadInputException("A data final não pode ser menor que a data inicial.");
            }

            var startUtc = DateTime.SpecifyKind(start, DateTimeKind.Utc);
            var endExclusive = DateTime.SpecifyKind(end.AddDays(1), DateTimeKind.Utc);

            return await BuildReportAsync(startUtc, endExclusive);
        }

        private async Task<ReportResponseDto> BuildReportAsync(DateTime startUtc, DateTime endExclusiveUtc)
        {
            var userId = _userContext.GetUserId();

            var baseQuery = _unitOfWork.Expenses.GetQueryable()
                .Where(e => e.UserId == userId && e.Date >= startUtc && e.Date < endExclusiveUtc);

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
    }
}
