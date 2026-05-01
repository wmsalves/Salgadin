using Salgadin.DTOs;

namespace Salgadin.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(UserRegisterDto dto);
        Task<string> LoginAsync(UserLoginDto dto);
        Task<string> LoginWithGoogleAsync(GoogleLoginRequest dto, CancellationToken cancellationToken = default);
        Task<UserProfileDto> GetProfileAsync();
        Task<(string Token, UserProfileDto Profile)> UpdateProfileAsync(UpdateUserProfileDto dto);
    }
}
