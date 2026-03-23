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
        public async Task<IActionResult> GetMonthly([FromQuery] int year, [FromQuery] int month)
        {
            var report = await _service.GetMonthlyAsync(year, month);
            return Ok(report);
        }

        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeekly([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var report = await _service.GetWeeklyAsync(startDate, endDate);
            return Ok(report);
        }
    }
}
