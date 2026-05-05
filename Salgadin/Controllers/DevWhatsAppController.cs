using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.DTOs;
using Salgadin.Services;

namespace Salgadin.Controllers;

[ApiController]
[Route("api/dev/whatsapp")]
[AllowAnonymous]
public class DevWhatsAppController : ControllerBase
{
    private readonly IWhatsAppIntegrationService _service;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public DevWhatsAppController(
        IWhatsAppIntegrationService service,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _service = service;
        _environment = environment;
        _configuration = configuration;
    }

    [HttpPost("simulate")]
    public async Task<IActionResult> Simulate([FromBody] SimulateWhatsAppMessageRequestDto request)
    {
        if (!_environment.IsDevelopment() &&
            !_configuration.GetValue<bool>("WhatsApp:EnableSimulationEndpoint"))
        {
            return NotFound();
        }

        var result = await _service.SimulateIncomingMessageAsync(
            request.From,
            request.Text,
            request.MessageId);

        return StatusCode(result.StatusCode, new SimulateWhatsAppMessageResponseDto
        {
            Reply = result.Reply
        });
    }
}
