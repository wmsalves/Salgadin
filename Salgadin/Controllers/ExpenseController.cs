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
        private readonly IQuickExpenseService _quickExpenseService;

        public ExpenseController(
            IExpenseService service,
            IExportService exportService,
            IQuickExpenseService quickExpenseService)
        {
            _service = service;
            _exportService = exportService;
            _quickExpenseService = quickExpenseService;
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

        /// <summary>Registra uma despesa a partir de texto livre, ex.: "cafe 7,50 ontem".</summary>
        [HttpPost("quick")]
        public async Task<IActionResult> CreateQuick([FromBody] QuickExpenseRequestDto dto)
        {
            var created = await _quickExpenseService.CreateFromTextAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>Gastos avulsos que o usuario mais repete (ultimos 90 dias).</summary>
        [HttpGet("frequent")]
        public async Task<IActionResult> GetFrequent([FromQuery] int limit = 6)
        {
            var frequent = await _quickExpenseService.GetFrequentAsync(limit);
            return Ok(frequent);
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
            [FromQuery] string? category = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? subcategoryId = null,
            [FromQuery] decimal? minAmount = null,
            [FromQuery] decimal? maxAmount = null)
        {
            var result = await _exportService.ExportExpensesAsync(
                format,
                startDate,
                endDate,
                category,
                categoryId,
                subcategoryId,
                minAmount,
                maxAmount);
            return File(result.Content, result.ContentType, result.FileName);
        }
    }
}
