using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Salgadin.Data;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;
using Salgadin.Services;
using System.IdentityModel.Tokens.Jwt;
using Xunit;

namespace Salgadin.Tests;

public class AuthServiceTests
{
    [Fact]
    public async Task LoginWithGoogleAsync_CreatesUserAndReturnsJwt()
    {
        await using var context = CreateContext();
        using var unitOfWork = new UnitOfWork(context);
        var validator = new FakeGoogleTokenValidator(new GoogleIdentityPayload
        {
            Subject = "google-sub-1",
            Email = "google@example.com",
            Name = "Google User",
            Picture = "https://example.com/avatar.png",
            EmailVerified = true
        });

        var service = CreateService(unitOfWork, validator);

        var token = await service.LoginWithGoogleAsync(new GoogleLoginRequest
        {
            IdToken = "valid-token"
        });

        var user = await context.Users.SingleAsync();
        var categories = await context.Categories.CountAsync(c => c.UserId == user.Id);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal("google-sub-1", user.GoogleSubjectId);
        Assert.Equal("google", user.ExternalProvider);
        Assert.Equal("https://example.com/avatar.png", user.AvatarUrl);
        Assert.False(user.HasLocalPassword);
        Assert.Equal(5, categories);
        Assert.Contains(jwt.Claims, claim => claim.Value == "google@example.com");
    }

    [Fact]
    public async Task LoginWithGoogleAsync_LinksExistingUserByEmail()
    {
        await using var context = CreateContext();
        context.Users.Add(new User
        {
            Name = "Existing User",
            Username = "existing@example.com",
            HasLocalPassword = true,
            PasswordHash = [1, 2, 3],
            PasswordSalt = [],
            ExternalProvider = "local"
        });
        await context.SaveChangesAsync();

        using var unitOfWork = new UnitOfWork(context);
        var validator = new FakeGoogleTokenValidator(new GoogleIdentityPayload
        {
            Subject = "google-sub-2",
            Email = "existing@example.com",
            Name = "Existing User",
            EmailVerified = true
        });

        var service = CreateService(unitOfWork, validator);

        var token = await service.LoginWithGoogleAsync(new GoogleLoginRequest
        {
            IdToken = "valid-token"
        });

        var user = await context.Users.SingleAsync();
        Assert.Equal("google-sub-2", user.GoogleSubjectId);
        Assert.Equal("local", user.ExternalProvider);
        Assert.True(user.HasLocalPassword);
        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact]
    public async Task LoginWithGoogleAsync_RejectsUnverifiedEmail()
    {
        await using var context = CreateContext();
        using var unitOfWork = new UnitOfWork(context);
        var validator = new FakeGoogleTokenValidator(new GoogleIdentityPayload
        {
            Subject = "google-sub-3",
            Email = "unverified@example.com",
            Name = "Google User",
            EmailVerified = false
        });

        var service = CreateService(unitOfWork, validator);

        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginWithGoogleAsync(new GoogleLoginRequest
            {
                IdToken = "valid-token"
            }));

        Assert.Equal("A conta do Google precisa ter email verificado.", ex.Message);
    }

    [Fact]
    public async Task ForgotPasswordAsync_WithExistingLocalUser_ReturnsGenericResponseAndCreatesToken()
    {
        await using var context = CreateContext();
        var user = await CreateLocalUserAsync(context, "local@example.com", "Senha@123");

        using var unitOfWork = new UnitOfWork(context);
        var sender = new FakePasswordResetLinkSender();
        var service = CreateService(unitOfWork, passwordResetLinkSender: sender);

        var message = await service.ForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Email = "local@example.com"
        });

        var resetToken = await context.PasswordResetTokens.SingleAsync();

        Assert.Equal("Se o email estiver cadastrado, enviaremos instruções para recuperação.", message);
        Assert.NotNull(sender.LastToken);
        Assert.Equal(user.Id, resetToken.UserId);
        Assert.False(resetToken.UsedAt.HasValue);
    }

    [Fact]
    public async Task ForgotPasswordAsync_WithUnknownEmail_ReturnsGenericResponse()
    {
        await using var context = CreateContext();
        using var unitOfWork = new UnitOfWork(context);
        var sender = new FakePasswordResetLinkSender();
        var service = CreateService(unitOfWork, passwordResetLinkSender: sender);

        var message = await service.ForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Email = "missing@example.com"
        });

        Assert.Equal("Se o email estiver cadastrado, enviaremos instruções para recuperação.", message);
        Assert.Null(sender.LastToken);
        Assert.Empty(context.PasswordResetTokens);
    }

    [Fact]
    public async Task ForgotPasswordAsync_WithGoogleOnlyUser_DoesNotCreateToken()
    {
        await using var context = CreateContext();
        context.Users.Add(new User
        {
            Name = "Google User",
            Username = "google-only@example.com",
            GoogleSubjectId = "google-sub-99",
            ExternalProvider = "google",
            HasLocalPassword = false,
            PasswordHash = [1, 2, 3],
            PasswordSalt = []
        });
        await context.SaveChangesAsync();

        using var unitOfWork = new UnitOfWork(context);
        var sender = new FakePasswordResetLinkSender();
        var service = CreateService(unitOfWork, passwordResetLinkSender: sender);

        var message = await service.ForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Email = "google-only@example.com"
        });

        Assert.Equal("Se o email estiver cadastrado, enviaremos instruções para recuperação.", message);
        Assert.Null(sender.LastToken);
        Assert.Empty(context.PasswordResetTokens);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithValidToken_ChangesPasswordAndMarksTokenAsUsed()
    {
        await using var context = CreateContext();
        await CreateLocalUserAsync(context, "reset@example.com", "Senha@123");

        using var unitOfWork = new UnitOfWork(context);
        var sender = new FakePasswordResetLinkSender();
        var service = CreateService(unitOfWork, passwordResetLinkSender: sender);

        await service.ForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Email = "reset@example.com"
        });

        await service.ResetPasswordAsync(new ResetPasswordRequestDto
        {
            Token = sender.LastToken!,
            NewPassword = "NovaSenha@123",
            ConfirmNewPassword = "NovaSenha@123"
        });

        var resetToken = await context.PasswordResetTokens.SingleAsync();
        var loginToken = await service.LoginAsync(new UserLoginDto
        {
            Username = "reset@example.com",
            Password = "NovaSenha@123"
        });

        Assert.NotNull(loginToken);
        Assert.True(resetToken.UsedAt.HasValue);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithExpiredToken_ThrowsBadInputException()
    {
        await using var context = CreateContext();
        await CreateLocalUserAsync(context, "expired@example.com", "Senha@123");

        using var unitOfWork = new UnitOfWork(context);
        var sender = new FakePasswordResetLinkSender();
        var service = CreateService(unitOfWork, passwordResetLinkSender: sender);

        await service.ForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Email = "expired@example.com"
        });

        var tokenEntity = await context.PasswordResetTokens.SingleAsync();
        tokenEntity.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);
        await context.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<BadInputException>(() =>
            service.ResetPasswordAsync(new ResetPasswordRequestDto
            {
                Token = sender.LastToken!,
                NewPassword = "NovaSenha@123",
                ConfirmNewPassword = "NovaSenha@123"
            }));

        Assert.Equal("O link de recuperação é inválido ou expirou.", ex.Message);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithUsedToken_ThrowsBadInputException()
    {
        await using var context = CreateContext();
        await CreateLocalUserAsync(context, "used@example.com", "Senha@123");

        using var unitOfWork = new UnitOfWork(context);
        var sender = new FakePasswordResetLinkSender();
        var service = CreateService(unitOfWork, passwordResetLinkSender: sender);

        await service.ForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Email = "used@example.com"
        });

        await service.ResetPasswordAsync(new ResetPasswordRequestDto
        {
            Token = sender.LastToken!,
            NewPassword = "NovaSenha@123",
            ConfirmNewPassword = "NovaSenha@123"
        });

        var ex = await Assert.ThrowsAsync<BadInputException>(() =>
            service.ResetPasswordAsync(new ResetPasswordRequestDto
            {
                Token = sender.LastToken!,
                NewPassword = "OutraSenha@123",
                ConfirmNewPassword = "OutraSenha@123"
            }));

        Assert.Equal("O link de recuperação é inválido ou expirou.", ex.Message);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithInvalidToken_ThrowsBadInputException()
    {
        await using var context = CreateContext();
        await CreateLocalUserAsync(context, "invalid@example.com", "Senha@123");

        using var unitOfWork = new UnitOfWork(context);
        var service = CreateService(unitOfWork);

        var ex = await Assert.ThrowsAsync<BadInputException>(() =>
            service.ResetPasswordAsync(new ResetPasswordRequestDto
            {
                Token = "invalid-token",
                NewPassword = "NovaSenha@123",
                ConfirmNewPassword = "NovaSenha@123"
            }));

        Assert.Equal("O link de recuperação é inválido ou expirou.", ex.Message);
    }

    private static AuthService CreateService(
        IUnitOfWork unitOfWork,
        IGoogleTokenValidator? validator = null,
        IPasswordResetLinkSender? passwordResetLinkSender = null)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "1234567890123456789012345678901234567890123456789012345678901234",
                ["Authentication:Google:ClientId"] = "google-client-id.apps.googleusercontent.com"
            })
            .Build();

        return new AuthService(
            unitOfWork,
            configuration,
            new FakeUserContextService(),
            validator ?? new FakeGoogleTokenValidator(new GoogleIdentityPayload()),
            passwordResetLinkSender ?? new FakePasswordResetLinkSender(),
            NullLogger<AuthService>.Instance);
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SalgadinContext(options);
    }

    private static async Task<User> CreateLocalUserAsync(SalgadinContext context, string email, string password)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = new User
        {
            Name = "Local User",
            Username = email,
            ExternalProvider = "local",
            HasLocalPassword = true,
            PasswordHash = System.Text.Encoding.UTF8.GetBytes(passwordHash),
            PasswordSalt = []
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    private sealed class FakeUserContextService : IUserContextService
    {
        public int GetUserId() => 1;
    }

    private sealed class FakeGoogleTokenValidator : IGoogleTokenValidator
    {
        private readonly GoogleIdentityPayload _payload;

        public FakeGoogleTokenValidator(GoogleIdentityPayload payload)
        {
            _payload = payload;
        }

        public Task<GoogleIdentityPayload> ValidateAsync(string idToken, string audience, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_payload);
        }
    }

    private sealed class FakePasswordResetLinkSender : IPasswordResetLinkSender
    {
        public bool CanSendPasswordResetLinks => true;

        public string? LastToken { get; private set; }

        public Task SendAsync(User user, string token, CancellationToken cancellationToken = default)
        {
            LastToken = token;
            return Task.CompletedTask;
        }
    }
}
