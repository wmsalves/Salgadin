using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Salgadin.Services
{
    public class AuthService : IAuthService
    {
        private const int TokenExpiryDays = 7;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
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

            CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);

            var user = new User
            {
                Name = dto.Name.Trim(),
                Username = normalizedUsername,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            await _unitOfWork.Users.AddAsync(user);

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

            await _unitOfWork.CompleteAsync();

            return GenerateToken(user);
        }

        public async Task<string> LoginAsync(UserLoginDto dto)
        {
            var normalizedUsername = NormalizeUsername(dto.Username);
            var user = await _unitOfWork.Users
                .GetQueryable()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername);

            if (user == null || !VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            {
                throw new UnauthorizedAccessException("Usuário ou senha inválidos.");
            }

            return GenerateToken(user);
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

        private static string NormalizeUsername(string username)
        {
            return username.Trim().ToLowerInvariant();
        }
    }
}
