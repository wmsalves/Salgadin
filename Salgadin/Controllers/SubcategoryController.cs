using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.DTOs;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    [ApiController]
    [Route("api/categories/{categoryId:int}/subcategories")]
    [Authorize]
    public class SubcategoryController : ControllerBase
    {
        private readonly ISubcategoryService _service;

        public SubcategoryController(ISubcategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int categoryId)
        {
            var result = await _service.GetAllByCategoryAsync(categoryId);
            return Ok(result);
        }

        [HttpGet("{id:int}", Name = "GetSubcategoryById")]
        public async Task<IActionResult> GetById(int categoryId, int id)
        {
            var subcategory = await _service.GetByIdAsync(categoryId, id);
            return subcategory is null ? NotFound() : Ok(subcategory);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int categoryId, [FromBody] CreateSubcategoryDto dto)
        {
            var created = await _service.CreateAsync(categoryId, dto);
            return CreatedAtAction(nameof(GetById), new { categoryId, id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int categoryId, int id, [FromBody] UpdateSubcategoryDto dto)
        {
            var updated = await _service.UpdateAsync(categoryId, id, dto);

            if (updated == null)
            {
                return NotFound(new { message = "Subcategoria não encontrada." });
            }

            return Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int categoryId, int id)
        {
            try
            {
                await _service.DeleteAsync(categoryId, id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
