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
        // Injeta a Unit of Work para centralizar o acesso a dados.
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<string> RegisterAsync(UserRegisterDto dto)
        {
            // Usa o repositório genérico para criar uma consulta otimizada no banco.
            var userExists = await _unitOfWork.Users
                .GetQueryable()
                .AnyAsync(u => u.Username == dto.Username);

            if (userExists)
            {
                // Lança uma exceção específica para ser tratada pelo middleware de erros.
                throw new BadInputException("O nome de usuário já está em uso.");
            }

            CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            // Adiciona o novo usuário e salva as alterações através da Unit of Work.
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
            var user = await _unitOfWork.Users
                .GetQueryable()
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null || !VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            {
                // Lança a exceção padrão do .NET para falhas de autenticação.
                // O middleware irá capturá-la e retornar o status 401 Unauthorized.
                throw new UnauthorizedAccessException("Usuário ou senha inválidos.");
            }

            return GenerateToken(user);
        }

        // Gera o hash e o salt para uma senha usando HMAC-SHA512 para armazenamento seguro.
        private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        // Verifica se a senha fornecida corresponde ao hash armazenado, usando o mesmo salt.
        private bool VerifyPassword(string password, byte[] hash, byte[] salt)
        {
            using var hmac = new HMACSHA512(salt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(hash);
        }

        // Cria um JSON Web Token (JWT) para o usuário autenticado.
        private string GenerateToken(User user)
        {
            // Define as 'claims' (informações) que serão incluídas no token.
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };

            // Obtém a chave de segurança do appsettings.json para assinar o token.
            var keyString = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("A chave JWT 'Jwt:Key' não está configurada.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

            // Cria as credenciais de assinatura usando o algoritmo HmacSha512.
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}