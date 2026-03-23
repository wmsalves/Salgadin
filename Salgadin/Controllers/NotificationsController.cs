using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.DTOs;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationsController(INotificationService service)
        {
            _service = service;
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferences()
        {
            var result = await _service.GetPreferencesAsync();
            return Ok(result);
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] UpdateNotificationPreferenceDto dto)
        {
            var result = await _service.UpsertPreferencesAsync(dto);
            return Ok(result);
        }

        [HttpGet("alerts")]
        public async Task<IActionResult> GetAlerts([FromQuery] int year, [FromQuery] int month)
        {
            var alerts = await _service.GetAlertsAsync(year, month);
            return Ok(alerts);
        }
    }
}
