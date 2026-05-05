using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Salgadin.Services;

public interface IWhatsAppExpenseMessageParser
{
    WhatsAppExpenseParseResult Parse(string message);
}

public sealed record WhatsAppExpenseParseResult(
    bool IsSuccess,
    decimal Amount,
    string Description,
    string InferredCategoryName,
    DateTime Date,
    string? ErrorMessage)
{
    public static WhatsAppExpenseParseResult Failure(string errorMessage) =>
        new(false, 0m, string.Empty, string.Empty, DateTime.UtcNow, errorMessage);
}

public class WhatsAppExpenseMessageParser : IWhatsAppExpenseMessageParser
{
    private static readonly Regex AmountRegex = new(@"(?<!\d)(\d+(?:[,.]\d{1,2})?)(?!\d)", RegexOptions.Compiled);
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "adicionar",
        "adicione",
        "gastei",
        "gasto",
        "paguei",
        "pagar",
        "reais",
        "real",
        "em",
        "com",
        "no",
        "na",
        "nos",
        "nas",
        "de",
        "do",
        "da",
        "um",
        "uma"
    };

    private static readonly Dictionary<string, string> CategoryKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        ["almoco"] = "Alimentacao",
        ["jantar"] = "Alimentacao",
        ["cafe"] = "Alimentacao",
        ["lanche"] = "Alimentacao",
        ["mercado"] = "Alimentacao",
        ["padaria"] = "Alimentacao",
        ["ifood"] = "Alimentacao",
        ["restaurante"] = "Alimentacao",
        ["uber"] = "Transporte",
        ["onibus"] = "Transporte",
        ["gasolina"] = "Transporte",
        ["transporte"] = "Transporte",
        ["estacionamento"] = "Transporte",
        ["cinema"] = "Lazer",
        ["netflix"] = "Lazer",
        ["show"] = "Lazer",
        ["jogo"] = "Lazer"
    };

    public WhatsAppExpenseParseResult Parse(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return WhatsAppExpenseParseResult.Failure("Envie uma mensagem com valor e descricao do gasto.");
        }

        var trimmed = message.Trim();
        var amountMatch = AmountRegex.Match(trimmed);
        if (!amountMatch.Success)
        {
            return WhatsAppExpenseParseResult.Failure("Nao encontrei o valor do gasto. Exemplo: \"Adicionar 50 em almoco\".");
        }

        var amountText = amountMatch.Value.Replace(',', '.');
        if (!decimal.TryParse(amountText, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount) || amount <= 0)
        {
            return WhatsAppExpenseParseResult.Failure("O valor informado nao parece valido.");
        }

        var withoutAmount = trimmed.Remove(amountMatch.Index, amountMatch.Length);
        var description = BuildDescription(withoutAmount);
        if (string.IsNullOrWhiteSpace(description))
        {
            return WhatsAppExpenseParseResult.Failure("Nao encontrei a descricao do gasto. Exemplo: \"50 cafe\".");
        }

        var category = InferCategory(description);
        return new WhatsAppExpenseParseResult(
            true,
            amount,
            description,
            category,
            DateTime.UtcNow,
            null);
    }

    private static string BuildDescription(string value)
    {
        var tokens = value
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(token => token.Trim('.', ',', ';', ':', '!', '?'))
            .Where(token => !string.IsNullOrWhiteSpace(token))
            .Where(token => !StopWords.Contains(RemoveDiacritics(token).ToLowerInvariant()))
            .ToArray();

        return string.Join(' ', tokens).Trim();
    }

    private static string InferCategory(string description)
    {
        var normalized = RemoveDiacritics(description).ToLowerInvariant();
        var words = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var word in words)
        {
            if (CategoryKeywords.TryGetValue(word, out var category))
            {
                return category;
            }
        }

        return "Outros";
    }

    internal static string RemoveDiacritics(string value)
    {
        var normalized = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(capacity: normalized.Length);

        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }
}
