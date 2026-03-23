using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.DTOs;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _service;
        private readonly IExportService _exportService;

        public ExpenseController(IExpenseService service, IExportService exportService)
        {
            _service = service;
            _exportService = exportService;
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var expense = await _service.GetExpenseByIdAsync(id);
            return expense is null ? NotFound() : Ok(expense);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? category = null)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 100) pageSize = 20;

            var result = await _service.GetPagedAsync(page, pageSize, startDate, endDate, category);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto)
        {
            var created = await _service.AddExpenseAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateExpenseDto dto)
        {
            await _service.UpdateExpenseAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteExpenseAsync(id);
            return NoContent();
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDailySummary(
            [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var summary = await _service.GetDailySummaryAsync(startDate, endDate);
            return Ok(summary);
        }

        [HttpGet("export")]
        public async Task<IActionResult> Export(
            [FromQuery] string format = "csv",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? category = null)
        {
            var result = await _exportService.ExportExpensesAsync(format, startDate, endDate, category);
            return File(result.Content, result.ContentType, result.FileName);
        }
    }
}
