using Google.Apis.Auth;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Salgadin.Services
{
    public class AuthService : IAuthService
    {
        private const int TokenExpiryDays = 7;
        private const int PasswordResetExpiryMinutes = 60;
        private const string ForgotPasswordGenericMessage = "Se o email estiver cadastrado, enviaremos instruções para recuperação.";

        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IUserContextService _userContextService;
        private readonly IGoogleTokenValidator _googleTokenValidator;
        private readonly IPasswordResetLinkSender _passwordResetLinkSender;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            IUserContextService userContextService,
            IGoogleTokenValidator googleTokenValidator,
            IPasswordResetLinkSender passwordResetLinkSender,
            ILogger<AuthService> logger)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _userContextService = userContextService;
            _googleTokenValidator = googleTokenValidator;
            _passwordResetLinkSender = passwordResetLinkSender;
            _logger = logger;
        }

        public async Task<string> RegisterAsync(UserRegisterDto dto)
        {
            var normalizedUsername = NormalizeUsername(dto.Username);

            var userExists = await _unitOfWork.Users
                .GetQueryable()
                .AnyAsync(u => u.Username.ToLower() == normalizedUsername);

            if (userExists)
            {
                throw new BadInputException("O nome de usuário já está em uso.");
            }

            CreatePasswordHash(dto.Password, out byte[] hash, out _);

            var user = new User
            {
                Name = dto.Name.Trim(),
                Username = normalizedUsername,
                HasLocalPassword = true,
                PasswordHash = hash,
                PasswordSalt = Array.Empty<byte>(),
                ExternalProvider = "local"
            };

            await _unitOfWork.Users.AddAsync(user);
            await AddDefaultCategoriesForUserAsync(user);
            await _unitOfWork.CompleteAsync();

            return GenerateToken(user);
        }

        public async Task<string> LoginAsync(UserLoginDto dto)
        {
            var normalizedUsername = NormalizeUsername(dto.Username);
            var user = await _unitOfWork.Users
                .GetQueryable()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername);

            if (user == null || !user.HasLocalPassword || !VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            {
                throw new UnauthorizedAccessException("Usuário ou senha inválidos.");
            }

            return GenerateToken(user);
        }

        public async Task<string> LoginWithGoogleAsync(GoogleLoginRequest dto, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(dto.IdToken))
            {
                throw new BadInputException("O token do Google é obrigatório.");
            }

            var clientId = _configuration["Authentication:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
            {
                throw new InvalidOperationException("Authentication:Google:ClientId not configured.");
            }

            GoogleIdentityPayload googleIdentity;
            try
            {
                googleIdentity = await _googleTokenValidator.ValidateAsync(dto.IdToken, clientId, cancellationToken);
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning(ex, "Falha ao validar id_token do Google.");
                throw new UnauthorizedAccessException("Token Google inválido.");
            }

            if (string.IsNullOrWhiteSpace(googleIdentity.Email))
            {
                throw new UnauthorizedAccessException("O token do Google não contém um email válido.");
            }

            if (!googleIdentity.EmailVerified)
            {
                throw new UnauthorizedAccessException("A conta do Google precisa ter email verificado.");
            }

            var normalizedEmail = NormalizeUsername(googleIdentity.Email);
            var user = await _unitOfWork.Users
                .GetQueryable()
                .FirstOrDefaultAsync(
                    u => u.GoogleSubjectId == googleIdentity.Subject || u.Username.ToLower() == normalizedEmail,
                    cancellationToken);

            if (user == null)
            {
                CreatePasswordHash(CreateRandomPassword(), out byte[] hash, out _);

                user = new User
                {
                    Name = string.IsNullOrWhiteSpace(googleIdentity.Name)
                        ? normalizedEmail
                        : googleIdentity.Name.Trim(),
                    Username = normalizedEmail,
                    GoogleSubjectId = googleIdentity.Subject,
                    ExternalProvider = "google",
                    AvatarUrl = googleIdentity.Picture,
                    HasLocalPassword = false,
                    PasswordHash = hash,
                    PasswordSalt = Array.Empty<byte>()
                };

                await _unitOfWork.Users.AddAsync(user);
                await AddDefaultCategoriesForUserAsync(user);
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(user.GoogleSubjectId) &&
                    !string.Equals(user.GoogleSubjectId, googleIdentity.Subject, StringComparison.Ordinal))
                {
                    throw new UnauthorizedAccessException("Esta conta já está vinculada a outro login Google.");
                }

                var hasChanges = false;

                if (string.IsNullOrWhiteSpace(user.GoogleSubjectId))
                {
                    user.GoogleSubjectId = googleIdentity.Subject;
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(user.ExternalProvider))
                {
                    user.ExternalProvider = "google";
                    hasChanges = true;
                }

                if (!string.IsNullOrWhiteSpace(googleIdentity.Picture) &&
                    !string.Equals(user.AvatarUrl, googleIdentity.Picture, StringComparison.Ordinal))
                {
                    user.AvatarUrl = googleIdentity.Picture;
                    hasChanges = true;
                }

                if (string.IsNullOrWhiteSpace(user.Name) && !string.IsNullOrWhiteSpace(googleIdentity.Name))
                {
                    user.Name = googleIdentity.Name.Trim();
                    hasChanges = true;
                }

                if (hasChanges)
                {
                    _unitOfWork.Users.Update(user);
                }
            }

            await _unitOfWork.CompleteAsync();
            _logger.LogInformation("Login Google concluído para o usuário {UserId}.", user.Id);

            return GenerateToken(user);
        }

        public async Task<string> ForgotPasswordAsync(ForgotPasswordRequestDto dto, CancellationToken cancellationToken = default)
        {
            if (!_passwordResetLinkSender.CanSendPasswordResetLinks)
            {
                throw new FeatureUnavailableException("A recuperação de senha não está disponível neste ambiente.");
            }

            var normalizedEmail = NormalizeUsername(dto.Email);
            var user = await _unitOfWork.Users
                .GetQueryable()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedEmail, cancellationToken);

            if (user == null)
            {
                return ForgotPasswordGenericMessage;
            }

            if (!user.HasLocalPassword)
            {
                _logger.LogInformation(
                    "Password recovery requested for user {UserId} without local password. Returning generic response.",
                    user.Id);
                return ForgotPasswordGenericMessage;
            }

            await InvalidateActivePasswordResetTokensAsync(user.Id, cancellationToken);

            var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = ComputeTokenHash(rawToken),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(PasswordResetExpiryMinutes)
            };

            await _unitOfWork.PasswordResetTokens.AddAsync(resetToken);
            await _unitOfWork.CompleteAsync();

            await _passwordResetLinkSender.SendAsync(user, rawToken, cancellationToken);

            _logger.LogInformation("Password recovery token generated for user {UserId}.", user.Id);

            return ForgotPasswordGenericMessage;
        }

        public async Task ResetPasswordAsync(ResetPasswordRequestDto dto, CancellationToken cancellationToken = default)
        {
            var tokenHash = ComputeTokenHash(dto.Token);
            var now = DateTime.UtcNow;

            var resetToken = await _unitOfWork.PasswordResetTokens
                .GetQueryable()
                .Include(token => token.User)
                .FirstOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

            if (resetToken == null ||
                resetToken.UsedAt.HasValue ||
                resetToken.ExpiresAt <= now ||
                resetToken.User == null)
            {
                throw new BadInputException("O link de recuperação é inválido ou expirou.");
            }

            CreatePasswordHash(dto.NewPassword, out byte[] hash, out _);

            resetToken.User.PasswordHash = hash;
            resetToken.User.PasswordSalt = Array.Empty<byte>();
            resetToken.User.HasLocalPassword = true;
            resetToken.UsedAt = now;

            await InvalidateActivePasswordResetTokensAsync(resetToken.UserId, cancellationToken, resetToken.Id);

            _unitOfWork.Users.Update(resetToken.User);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Password reset completed for user {UserId}.", resetToken.UserId);
        }

        public async Task<UserProfileDto> GetProfileAsync()
        {
            var userId = _userContextService.GetUserId();
            var user = await _unitOfWork.Users.GetQueryable()
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("Usuário não encontrado.");

            return ToProfileDto(user);
        }

        public async Task<(string Token, UserProfileDto Profile)> UpdateProfileAsync(UpdateUserProfileDto dto)
        {
            var userId = _userContextService.GetUserId();
            var user = await _unitOfWork.Users.GetQueryable()
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("Usuário não encontrado.");

            var normalizedEmail = NormalizeUsername(dto.Email);
            var emailChanged = !string.Equals(user.Username, normalizedEmail, StringComparison.Ordinal);
            var passwordChanged = !string.IsNullOrWhiteSpace(dto.NewPassword);

            if (emailChanged || passwordChanged)
            {
                if (string.IsNullOrWhiteSpace(dto.CurrentPassword) ||
                    !VerifyPassword(dto.CurrentPassword, user.PasswordHash, user.PasswordSalt))
                {
                    throw new UnauthorizedAccessException("A senha atual informada é inválida.");
                }
            }

            if (emailChanged)
            {
                var emailExists = await _unitOfWork.Users.GetQueryable()
                    .AnyAsync(u => u.Id != userId && u.Username.ToLower() == normalizedEmail);

                if (emailExists)
                {
                    throw new BadInputException("O email informado já está em uso.");
                }

                user.Username = normalizedEmail;
            }

            user.Name = dto.Name.Trim();
            user.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber)
                ? null
                : dto.PhoneNumber.Trim();

            if (passwordChanged)
            {
                CreatePasswordHash(dto.NewPassword!, out byte[] hash, out _);
                user.PasswordHash = hash;
                user.PasswordSalt = Array.Empty<byte>();
                user.HasLocalPassword = true;
            }

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return (GenerateToken(user), ToProfileDto(user));
        }

        private async Task AddDefaultCategoriesForUserAsync(User user)
        {
            var defaultCategories = new List<Category>
            {
                new Category { Name = "Alimentação", User = user },
                new Category { Name = "Transporte", User = user },
                new Category { Name = "Moradia", User = user },
                new Category { Name = "Lazer", User = user },
                new Category { Name = "Outros", User = user }
            };

            foreach (var category in defaultCategories)
            {
                await _unitOfWork.Categories.AddAsync(category);
            }
        }

        private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            var hashStr = BCrypt.Net.BCrypt.HashPassword(password);
            hash = Encoding.UTF8.GetBytes(hashStr);
            salt = Array.Empty<byte>();
        }

        private bool VerifyPassword(string password, byte[] hash, byte[] salt)
        {
            try
            {
                var hashStr = Encoding.UTF8.GetString(hash);
                return BCrypt.Net.BCrypt.Verify(password, hashStr);
            }
            catch
            {
                return false;
            }
        }

        private string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, string.IsNullOrWhiteSpace(user.Name) ? user.Username : user.Name),
                new Claim(ClaimTypes.Email, user.Username)
            };

            var keyString = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("A chave JWT 'Jwt:Key' não está configurada.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(TokenExpiryDays),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private async Task InvalidateActivePasswordResetTokensAsync(
            int userId,
            CancellationToken cancellationToken,
            int? skipTokenId = null)
        {
            var now = DateTime.UtcNow;
            var activeTokens = await _unitOfWork.PasswordResetTokens
                .GetQueryable()
                .Where(token =>
                    token.UserId == userId &&
                    !token.UsedAt.HasValue &&
                    token.ExpiresAt > now &&
                    (!skipTokenId.HasValue || token.Id != skipTokenId.Value))
                .ToListAsync(cancellationToken);

            foreach (var token in activeTokens)
            {
                token.UsedAt = now;
            }
        }

        private static string ComputeTokenHash(string token)
        {
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(hash);
        }

        private static string CreateRandomPassword()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        }

        private static string NormalizeUsername(string username)
        {
            return username.Trim().ToLowerInvariant();
        }

        private static UserProfileDto ToProfileDto(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Username,
                PhoneNumber = user.PhoneNumber,
                AvatarUrl = user.AvatarUrl
            };
        }
    }
}
