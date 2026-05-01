using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Salgadin.Data;
using Salgadin.DTOs;
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
            PasswordHash = [1, 2, 3],
            PasswordSalt = [],
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
        Assert.Equal("google", user.ExternalProvider);
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

    private static AuthService CreateService(IUnitOfWork unitOfWork, IGoogleTokenValidator validator)
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
            validator,
            NullLogger<AuthService>.Instance);
    }

    private static SalgadinContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SalgadinContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new SalgadinContext(options);
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
}
