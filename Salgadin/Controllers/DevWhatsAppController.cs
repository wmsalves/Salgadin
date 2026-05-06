using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salgadin.DTOs;
using Salgadin.Services;
using System.Security.Claims;

namespace Salgadin.Controllers;

[ApiController]
[Route("api/dev/whatsapp")]
[AllowAnonymous]
public class DevWhatsAppController : ControllerBase
{
    private readonly IWhatsAppIntegrationService _service;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DevWhatsAppController> _logger;

    public DevWhatsAppController(
        IWhatsAppIntegrationService service,
        IWebHostEnvironment environment,
        IConfiguration configuration,
        ILogger<DevWhatsAppController> logger)
    {
        _service = service;
        _environment = environment;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("simulate")]
    public async Task<IActionResult> Simulate([FromBody] SimulateWhatsAppMessageRequestDto request)
    {
        if (!_environment.IsDevelopment() &&
            !_configuration.GetValue<bool>("WhatsApp:EnableSimulationEndpoint"))
        {
            return NotFound();
        }

        if (!_environment.IsDevelopment())
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                _logger.LogWarning("WhatsApp simulator access denied: unauthenticated request.");
                return Unauthorized(new SimulateWhatsAppMessageResponseDto
                {
                    Reply = "Autentique-se para usar o simulador WhatsApp neste ambiente."
                });
            }

            var email = User.FindFirstValue(ClaimTypes.Email);
            if (!IsAllowedEmail(email))
            {
                _logger.LogWarning(
                    "WhatsApp simulator access denied for email {Email}.",
                    MaskEmail(email));

                return Forbid();
            }
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

    private bool IsAllowedEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        var allowedEmails = _configuration["WhatsApp:SimulatorAllowedEmails"]?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? [];

        return allowedEmails.Any(allowed =>
            string.Equals(allowed, email, StringComparison.OrdinalIgnoreCase));
    }

    private static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return "unknown";
        }

        var parts = email.Split('@', 2);
        if (parts.Length != 2 || parts[0].Length == 0)
        {
            return "invalid";
        }

        var local = parts[0].Length == 1
            ? "*"
            : $"{parts[0][0]}***";

        return $"{local}@{parts[1]}";
    }
}
