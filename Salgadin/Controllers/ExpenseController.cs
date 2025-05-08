using Microsoft.AspNetCore.Mvc;
using Salgadin.DTOs;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    public class ExpenseController : Controller
    {
        private readonly IExpenseService _service;

        public ExpenseController(IExpenseService service)
        {
            _service = service;
        }

        // GET: Expense
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var expenses = await _service.GetAllExpensesAsync();
            return Ok(expenses);
        }

        // POST: Expense
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto)
        {
            await _service.AddExpenseAsync(dto);
            return CreatedAtAction(nameof(GetAll), null);
        }

        // DELETE: Expense/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteExpenseAsync(id);
            return NoContent();
        }
    }
}
