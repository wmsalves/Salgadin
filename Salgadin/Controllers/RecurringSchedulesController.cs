using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.DTOs;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    [ApiController]
    [Route("api/recurring-schedules")]
    [Authorize]
    public class RecurringSchedulesController : ControllerBase
    {
        private readonly IRecurringScheduleService _service;

        public RecurringSchedulesController(IRecurringScheduleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var result = await _service.GetSummaryAsync();
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var schedule = await _service.GetByIdAsync(id);
            return schedule is null ? NotFound() : Ok(schedule);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRecurringScheduleDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRecurringScheduleDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated is null ? NotFound() : Ok(updated);
        }

        [HttpPatch("{id:int}/pause")]
        public async Task<IActionResult> Pause(int id)
        {
            var updated = await _service.PauseAsync(id);
            return updated is null ? NotFound() : Ok(updated);
        }

        [HttpPatch("{id:int}/resume")]
        public async Task<IActionResult> Resume(int id)
        {
            var updated = await _service.ResumeAsync(id);
            return updated is null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Archive(int id)
        {
            await _service.ArchiveAsync(id);
            return NoContent();
        }

        [HttpPost("generate-due")]
        public async Task<IActionResult> GenerateDue([FromQuery] DateTime? untilDate = null)
        {
            var result = await _service.GenerateDueForCurrentUserAsync(untilDate);
            return Ok(result);
        }
    }
}
