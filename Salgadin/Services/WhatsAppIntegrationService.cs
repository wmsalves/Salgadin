using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Salgadin.Data;
using Salgadin.DTOs;
using Salgadin.Models;

namespace Salgadin.Services;

public interface IWhatsAppIntegrationService
{
    Task<WhatsAppLinkCodeResponseDto> GenerateLinkCodeAsync();
    Task<WhatsAppStatusResponseDto> GetStatusAsync();
    Task DisconnectAsync();
    Task<WhatsAppSimulationResult> SimulateIncomingMessageAsync(string from, string text, string messageId);
}

public sealed record WhatsAppSimulationResult(
    int StatusCode,
    string Reply,
    bool CreatedExpense = false,
    bool Duplicate = false);

public class WhatsAppIntegrationService : IWhatsAppIntegrationService
{
    private readonly SalgadinContext _dbContext;
    private readonly IUserContextService _userContext;
    private readonly IWhatsAppExpenseMessageParser _parser;
    private readonly IExpenseService _expenseService;
    private readonly ILogger<WhatsAppIntegrationService> _logger;

    public WhatsAppIntegrationService(
        SalgadinContext dbContext,
        IUserContextService userContext,
        IWhatsAppExpenseMessageParser parser,
        IExpenseService expenseService,
        ILogger<WhatsAppIntegrationService> logger)
    {
        _dbContext = dbContext;
        _userContext = userContext;
        _parser = parser;
        _expenseService = expenseService;
        _logger = logger;
    }

    public async Task<WhatsAppLinkCodeResponseDto> GenerateLinkCodeAsync()
    {
        var userId = _userContext.GetUserId();
        var user = await _dbContext.Users.FirstOrDefaultAsync(item => item.Id == userId)
            ?? throw new UnauthorizedAccessException("Usuario nao autenticado.");

        var normalizedPhone = NormalizePhoneNumber(user.PhoneNumber);
        if (normalizedPhone is null)
        {
            throw new InvalidOperationException("Cadastre um telefone valido no perfil antes de conectar o WhatsApp.");
        }

        var now = DateTime.UtcNow;
        var code = $"SALGADIN-{RandomNumberGenerator.GetInt32(100000, 999999)}";
        var linkCode = new WhatsAppLinkCode
        {
            UserId = userId,
            Code = code,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(15)
        };

        await _dbContext.WhatsAppLinkCodes.AddAsync(linkCode);

        var otherActiveAccounts = await _dbContext.UserWhatsAppAccounts
            .Where(item => item.UserId != userId && item.PhoneNumber == normalizedPhone && item.IsActive)
            .ToListAsync();

        foreach (var otherAccount in otherActiveAccounts)
        {
            otherAccount.IsActive = false;
            otherAccount.UpdatedAt = now;
        }

        var account = await _dbContext.UserWhatsAppAccounts
            .FirstOrDefaultAsync(item => item.UserId == userId);

        if (account is null)
        {
            account = new UserWhatsAppAccount
            {
                UserId = userId,
                PhoneNumber = normalizedPhone,
                IsActive = true,
                CreatedAt = now
            };
            await _dbContext.UserWhatsAppAccounts.AddAsync(account);
        }
        else
        {
            account.PhoneNumber = normalizedPhone;
            account.IsActive = true;
            account.UpdatedAt = now;
            _dbContext.UserWhatsAppAccounts.Update(account);
        }

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Generated WhatsApp link code for user {UserId}.", userId);

        return new WhatsAppLinkCodeResponseDto
        {
            Code = code,
            ExpiresAt = linkCode.ExpiresAt
        };
    }

    public async Task<WhatsAppStatusResponseDto> GetStatusAsync()
    {
        var userId = _userContext.GetUserId();
        var account = await _dbContext.UserWhatsAppAccounts
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId && item.IsActive);

        return new WhatsAppStatusResponseDto
        {
            Connected = account is not null,
            PhoneNumber = account?.PhoneNumber
        };
    }

    public async Task DisconnectAsync()
    {
        var userId = _userContext.GetUserId();
        var accounts = await _dbContext.UserWhatsAppAccounts
            .Where(item => item.UserId == userId && item.IsActive)
            .ToListAsync();

        foreach (var account in accounts)
        {
            account.IsActive = false;
            account.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Disconnected WhatsApp account for user {UserId}.", userId);
    }

    public async Task<WhatsAppSimulationResult> SimulateIncomingMessageAsync(string from, string text, string messageId)
    {
        if (string.IsNullOrWhiteSpace(messageId))
        {
            return new WhatsAppSimulationResult(StatusCodes.Status400BadRequest, "Nao consegui identificar essa mensagem.");
        }

        var normalizedPhone = NormalizePhoneNumber(from);
        if (normalizedPhone is null)
        {
            return new WhatsAppSimulationResult(StatusCodes.Status400BadRequest, "O telefone da mensagem nao parece valido.");
        }

        var existingMessage = await _dbContext.WhatsAppProcessedMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.ProviderMessageId == messageId);

        if (existingMessage is not null)
        {
            return new WhatsAppSimulationResult(
                StatusCodes.Status200OK,
                "Mensagem ja processada. Nenhuma despesa duplicada foi criada.",
                Duplicate: true);
        }

        var account = await _dbContext.UserWhatsAppAccounts
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.PhoneNumber == normalizedPhone && item.IsActive);

        if (account is null)
        {
            _logger.LogWarning("Rejected simulated WhatsApp message for an unlinked phone.");
            return new WhatsAppSimulationResult(
                StatusCodes.Status404NotFound,
                "Este telefone ainda nao esta conectado ao Salgadin.");
        }

        var parseResult = _parser.Parse(text);
        if (!parseResult.IsSuccess)
        {
            return new WhatsAppSimulationResult(
                StatusCodes.Status400BadRequest,
                parseResult.ErrorMessage ?? "Nao entendi o gasto informado.");
        }

        var category = await FindCategoryAsync(account.UserId, parseResult.InferredCategoryName);
        if (category is null)
        {
            return new WhatsAppSimulationResult(
                StatusCodes.Status400BadRequest,
                $"Nao encontrei uma categoria \"{parseResult.InferredCategoryName}\" ou \"Outros\" para este usuario.");
        }

        var createdExpense = await _expenseService.AddExpenseForUserAsync(account.UserId, new CreateExpenseDto
        {
            Amount = parseResult.Amount,
            Description = parseResult.Description,
            CategoryId = category.Id,
            Date = parseResult.Date
        });

        await _dbContext.WhatsAppProcessedMessages.AddAsync(new WhatsAppProcessedMessage
        {
            ProviderMessageId = messageId,
            PhoneNumber = normalizedPhone,
            UserId = account.UserId,
            ProcessedAt = DateTime.UtcNow
        });
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Processed simulated WhatsApp expense message for user {UserId} and category {CategoryId}.",
            account.UserId,
            category.Id);

        return new WhatsAppSimulationResult(
            StatusCodes.Status200OK,
            $"Despesa adicionada: R$ {createdExpense.Amount:N2} em {createdExpense.Description}.",
            CreatedExpense: true);
    }

    public static string? NormalizePhoneNumber(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var digits = new string(value.Where(char.IsDigit).ToArray());

        if (digits.Length == 11)
        {
            digits = $"55{digits}";
        }

        if (digits.Length < 10 || digits.Length > 15)
        {
            return null;
        }

        return $"+{digits}";
    }

    private async Task<Category?> FindCategoryAsync(int userId, string inferredCategoryName)
    {
        var categories = await _dbContext.Categories
            .Where(category => category.UserId == userId)
            .ToListAsync();

        var inferredKey = NormalizeCategoryName(inferredCategoryName);
        var fallbackKeys = new[] { "outros", "other" };

        return categories.FirstOrDefault(category => NormalizeCategoryName(category.Name) == inferredKey)
            ?? categories.FirstOrDefault(category => fallbackKeys.Contains(NormalizeCategoryName(category.Name)));
    }

    private static string NormalizeCategoryName(string value) =>
        WhatsAppExpenseMessageParser.RemoveDiacritics(value).ToLowerInvariant().Trim();
}
