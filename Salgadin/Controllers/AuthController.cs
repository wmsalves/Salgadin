using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Salgadin.DTOs;
using Microsoft.AspNetCore.RateLimiting;
using Salgadin.Services;

namespace Salgadin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            var token = await _authService.RegisterAsync(dto);
            return Ok(new { token });
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var token = await _authService.LoginAsync(dto);
            return Ok(new { token });
        }

        [HttpPost("google")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Google([FromBody] GoogleLoginRequest dto, CancellationToken cancellationToken)
        {
            var token = await _authService.LoginWithGoogleAsync(dto, cancellationToken);
            return Ok(new { token });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var profile = await _authService.GetProfileAsync();
            return Ok(profile);
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            var result = await _authService.UpdateProfileAsync(dto);
            return Ok(new
            {
                token = result.Token,
                profile = result.Profile
            });
        }
    }
}
