namespace Salgadin.Services
{
    public sealed class GoogleIdentityPayload
    {
        public string Subject { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string? Picture { get; init; }
        public bool EmailVerified { get; init; }
    }

    public interface IGoogleTokenValidator
    {
        Task<GoogleIdentityPayload> ValidateAsync(string idToken, string audience, CancellationToken cancellationToken = default);
    }
}
