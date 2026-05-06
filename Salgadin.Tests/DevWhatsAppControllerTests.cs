using System.Security.Claims;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using Salgadin.Controllers;
using Salgadin.DTOs;
using Salgadin.Services;
using Xunit;

namespace Salgadin.Tests;

public class DevWhatsAppControllerTests
{
    [Fact]
    public async Task Simulate_AllowsDevelopmentWithoutAuthenticatedUser()
    {
        var controller = CreateController(environmentName: "Development");

        var result = await controller.Simulate(CreateRequest());

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, objectResult.StatusCode);
    }

    [Fact]
    public async Task Simulate_ReturnsNotFoundOutsideDevelopment_WhenEndpointDisabled()
    {
        var controller = CreateController(environmentName: "Production");

        var result = await controller.Simulate(CreateRequest());

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Simulate_ReturnsUnauthorizedOutsideDevelopment_WhenUserIsMissing()
    {
        var controller = CreateController(
            environmentName: "Production",
            enableEndpoint: true,
            allowedEmails: "allowed@example.com");

        var result = await controller.Simulate(CreateRequest());

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Simulate_ReturnsForbiddenOutsideDevelopment_WhenEmailIsNotAllowed()
    {
        var controller = CreateController(
            environmentName: "Production",
            enableEndpoint: true,
            allowedEmails: "allowed@example.com",
            userEmail: "other@example.com");

        var result = await controller.Simulate(CreateRequest());

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Simulate_AllowsAuthorizedEmailOutsideDevelopment()
    {
        var controller = CreateController(
            environmentName: "Production",
            enableEndpoint: true,
            allowedEmails: "allowed@example.com",
            userEmail: "allowed@example.com");

        var result = await controller.Simulate(CreateRequest());

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, objectResult.StatusCode);
    }

    private static DevWhatsAppController CreateController(
        string environmentName,
        bool enableEndpoint = false,
        string? allowedEmails = null,
        string? userEmail = null)
    {
        var configurationValues = new Dictionary<string, string?>
        {
            ["WhatsApp:EnableSimulationEndpoint"] = enableEndpoint.ToString(),
            ["WhatsApp:SimulatorAllowedEmails"] = allowedEmails
        };
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configurationValues)
            .Build();

        var controller = new DevWhatsAppController(
            new FakeWhatsAppIntegrationService(),
            new FakeWebHostEnvironment(environmentName),
            configuration,
            NullLogger<DevWhatsAppController>.Instance);

        var httpContext = new DefaultHttpContext();
        if (!string.IsNullOrWhiteSpace(userEmail))
        {
            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(ClaimTypes.Email, userEmail)],
                authenticationType: "Test"));
        }

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        return controller;
    }

    private static SimulateWhatsAppMessageRequestDto CreateRequest() =>
        new()
        {
            From = "+5531999999999",
            Text = "Adicionar 50 em almoço",
            MessageId = "test-controller"
        };

    private sealed class FakeWhatsAppIntegrationService : IWhatsAppIntegrationService
    {
        public Task<WhatsAppLinkCodeResponseDto> GenerateLinkCodeAsync() =>
            Task.FromResult(new WhatsAppLinkCodeResponseDto());

        public Task<WhatsAppStatusResponseDto> GetStatusAsync() =>
            Task.FromResult(new WhatsAppStatusResponseDto());

        public Task DisconnectAsync() => Task.CompletedTask;

        public Task<WhatsAppSimulationResult> SimulateIncomingMessageAsync(
            string from,
            string text,
            string messageId) =>
            Task.FromResult(new WhatsAppSimulationResult(
                StatusCodes.Status200OK,
                "Despesa adicionada: R$ 50,00 em almoço.",
                CreatedExpense: true));
    }

    private sealed class FakeWebHostEnvironment : IWebHostEnvironment
    {
        public FakeWebHostEnvironment(string environmentName)
        {
            EnvironmentName = environmentName;
        }

        public string EnvironmentName { get; set; }
        public string ApplicationName { get; set; } = "Salgadin.Tests";
        public string WebRootPath { get; set; } = string.Empty;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
