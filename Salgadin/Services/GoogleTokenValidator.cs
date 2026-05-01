using Google.Apis.Auth;

namespace Salgadin.Services
{
    public class GoogleTokenValidator : IGoogleTokenValidator
    {
        public async Task<GoogleIdentityPayload> ValidateAsync(string idToken, string audience, CancellationToken cancellationToken = default)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [audience]
                });

            return new GoogleIdentityPayload
            {
                Subject = payload.Subject,
                Email = payload.Email,
                Name = payload.Name ?? payload.Email,
                Picture = payload.Picture,
                EmailVerified = payload.EmailVerified
            };
        }
    }
}
