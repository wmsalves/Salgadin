using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.Services;

namespace Salgadin.Controllers;

[ApiController]
[Route("api/whatsapp")]
[Authorize]
public class WhatsAppController : ControllerBase
{
    private readonly IWhatsAppIntegrationService _service;

    public WhatsAppController(IWhatsAppIntegrationService service)
    {
        _service = service;
    }

    [HttpPost("link-code")]
    public async Task<IActionResult> GenerateLinkCode()
    {
        try
        {
            var result = await _service.GenerateLinkCodeAsync();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var result = await _service.GetStatusAsync();
        return Ok(result);
    }

    [HttpDelete("disconnect")]
    public async Task<IActionResult> Disconnect()
    {
        await _service.DisconnectAsync();
        return NoContent();
    }
}
