using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    [ApiController]
    [Route("api/calendar")]
    [Authorize]
    public class CalendarController : ControllerBase
    {
        private readonly ICalendarService _service;

        public CalendarController(ICalendarService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetMonth([FromQuery] int? year = null, [FromQuery] int? month = null)
        {
            var result = await _service.GetMonthAsync(year, month);
            return Ok(result);
        }
    }
}
