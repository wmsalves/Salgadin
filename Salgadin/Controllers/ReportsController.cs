using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _service;

        public ReportsController(IReportService service)
        {
            _service = service;
        }

        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthly(
            [FromQuery] int year,
            [FromQuery] int month,
            [FromQuery] int? categoryId,
            [FromQuery] int? subcategoryId,
            [FromQuery] decimal? minAmount,
            [FromQuery] decimal? maxAmount)
        {
            var report = await _service.GetMonthlyAsync(
                year,
                month,
                categoryId,
                subcategoryId,
                minAmount,
                maxAmount);
            return Ok(report);
        }

        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeekly(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] int? categoryId,
            [FromQuery] int? subcategoryId,
            [FromQuery] decimal? minAmount,
            [FromQuery] decimal? maxAmount)
        {
            var report = await _service.GetWeeklyAsync(
                startDate,
                endDate,
                categoryId,
                subcategoryId,
                minAmount,
                maxAmount);
            return Ok(report);
        }

        [HttpGet("compare-monthly")]
        public async Task<IActionResult> CompareMonthly(
            [FromQuery] int year,
            [FromQuery] int month,
            [FromQuery] int compareYear,
            [FromQuery] int compareMonth,
            [FromQuery] int? categoryId,
            [FromQuery] int? subcategoryId,
            [FromQuery] decimal? minAmount,
            [FromQuery] decimal? maxAmount)
        {
            var report = await _service.CompareMonthlyAsync(
                year,
                month,
                compareYear,
                compareMonth,
                categoryId,
                subcategoryId,
                minAmount,
                maxAmount);
            return Ok(report);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? categoryId,
            [FromQuery] int? subcategoryId,
            [FromQuery] decimal? minAmount,
            [FromQuery] decimal? maxAmount)
        {
            var today = DateTime.UtcNow.Date;
            var start = startDate ?? new DateTime(today.Year, today.Month, 1);
            var end = endDate ?? today;

            var summary = await _service.GetSummaryAsync(
                start,
                end,
                categoryId,
                subcategoryId,
                minAmount,
                maxAmount);
            return Ok(summary);
        }
    }
}
