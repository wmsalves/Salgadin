using Salgadin.Models;

namespace Salgadin.Services;

public interface IPasswordResetLinkSender
{
    bool CanSendPasswordResetLinks { get; }
    Task SendAsync(User user, string token, CancellationToken cancellationToken = default);
}
