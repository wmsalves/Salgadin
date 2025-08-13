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

        public ExpenseController(IExpenseService service)
        {
            _service = service;
        }

        // GET: Expense
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] string? category)
        {
            var expenses = await _service.GetFilteredExpensesAsync(startDate, endDate, category);
            return Ok(expenses);
        }

        // POST: Expense
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto)
        {
            var created = await _service.AddExpenseAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // DELETE: Expense/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteExpenseAsync(id);
            return NoContent();
        }

        // PUT: Expense/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateExpenseDto dto)
        {
            try
            {
                await _service.UpdateExpenseAsync(id, dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: Expense/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var expense = await _service.GetExpenseByIdAsync(id);
            if (expense is null) return NotFound();
            return Ok(expense);
        }

        // GET:
        [HttpGet("summary")]
        public async Task<IActionResult> GetDailySummary([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var summary = await _service.GetDailySummaryAsync(startDate, endDate);
            return Ok(summary);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1,[FromQuery] DateTime? startDate = null,[FromQuery] int pageSize = 20,[FromQuery] DateTime? endDate = null,[FromQuery] string? category = null)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 100) pageSize = 20;

            var result = await _service.GetPagedAsync(page, pageSize, startDate, endDate, category);
            return Ok(result);
        }

    }
}
