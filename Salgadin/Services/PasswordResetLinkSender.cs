using System.Net;
using System.Net.Mail;
using Salgadin.Exceptions;
using Salgadin.Models;

namespace Salgadin.Services;

public class PasswordResetLinkSender : IPasswordResetLinkSender
{
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<PasswordResetLinkSender> _logger;

    public PasswordResetLinkSender(
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<PasswordResetLinkSender> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    public bool CanSendPasswordResetLinks
    {
        get
        {
            if (_environment.IsDevelopment())
            {
                return true;
            }

            return !string.IsNullOrWhiteSpace(GetBaseUrl())
                && !string.IsNullOrWhiteSpace(_configuration["PasswordReset:Smtp:Host"])
                && !string.IsNullOrWhiteSpace(_configuration["PasswordReset:FromEmail"]);
        }
    }

    public async Task SendAsync(User user, string token, CancellationToken cancellationToken = default)
    {
        var resetLink = BuildResetLink(token);

        if (_environment.IsDevelopment())
        {
            _logger.LogInformation(
                "Password reset link generated for user {UserId}: {ResetLink}",
                user.Id,
                resetLink);
            return;
        }

        if (!CanSendPasswordResetLinks)
        {
            throw new FeatureUnavailableException("A recuperação de senha não está disponível neste ambiente.");
        }

        using var message = new MailMessage
        {
            From = new MailAddress(
                _configuration["PasswordReset:FromEmail"]!,
                _configuration["PasswordReset:FromName"] ?? "Salgadin"),
            Subject = "Recuperação de senha - Salgadin",
            Body =
                "Recebemos um pedido para redefinir sua senha no Salgadin." + Environment.NewLine + Environment.NewLine +
                $"Use este link para continuar: {resetLink}" + Environment.NewLine + Environment.NewLine +
                "Se você não solicitou essa alteração, ignore este email.",
            IsBodyHtml = false
        };

        message.To.Add(user.Username);

        using var client = new SmtpClient(
            _configuration["PasswordReset:Smtp:Host"],
            int.TryParse(_configuration["PasswordReset:Smtp:Port"], out var port) ? port : 587)
        {
            EnableSsl = !bool.TryParse(_configuration["PasswordReset:Smtp:EnableSsl"], out var enableSsl) || enableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        var username = _configuration["PasswordReset:Smtp:Username"];
        var password = _configuration["PasswordReset:Smtp:Password"];

        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        await client.SendMailAsync(message, cancellationToken);
    }

    private string BuildResetLink(string token)
    {
        var baseUrl = GetBaseUrl();
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new FeatureUnavailableException("A recuperação de senha não está disponível neste ambiente.");
        }

        return $"{baseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";
    }

    private string GetBaseUrl()
    {
        var configuredBaseUrl = _configuration["PasswordReset:BaseUrl"];
        if (!string.IsNullOrWhiteSpace(configuredBaseUrl))
        {
            return configuredBaseUrl;
        }

        return _environment.IsDevelopment()
            ? "http://localhost:5173"
            : string.Empty;
    }
}
