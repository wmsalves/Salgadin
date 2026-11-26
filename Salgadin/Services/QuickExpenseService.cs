using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public interface IQuickExpenseService
    {
        /// <summary>Cria uma despesa a partir de texto livre ("cafe 7,50 ontem").</summary>
        Task<ExpenseDto> CreateFromTextAsync(QuickExpenseRequestDto request);

        /// <summary>Gastos avulsos que o usuario mais repete nos ultimos 90 dias.</summary>
        Task<IReadOnlyList<FrequentExpenseDto>> GetFrequentAsync(int limit);
    }

    public class QuickExpenseService : IQuickExpenseService
    {
        private const int FrequentWindowDays = 90;
        private const int MaxFrequent = 8;

        private static readonly Dictionary<string, int> RelativeDays = new(StringComparer.OrdinalIgnoreCase)
        {
            ["hoje"] = 0,
            ["ontem"] = 1,
            ["anteontem"] = 2,
        };

        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        private readonly IWhatsAppExpenseMessageParser _parser;
        private readonly IExpenseService _expenseService;

        public QuickExpenseService(
            IUnitOfWork unitOfWork,
            IUserContextService userContext,
            IWhatsAppExpenseMessageParser parser,
            IExpenseService expenseService)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _parser = parser;
            _expenseService = expenseService;
        }

        public async Task<ExpenseDto> CreateFromTextAsync(QuickExpenseRequestDto request)
        {
            var userId = _userContext.GetUserId();
            var (text, daysAgo) = ExtractRelativeDay(request.Text ?? string.Empty);

            var parsed = _parser.Parse(text);
            if (!parsed.IsSuccess)
            {
                throw new BadInputException(parsed.ErrorMessage ?? "Não entendi esse gasto.");
            }

            var categoryId = await ResolveCategoryIdAsync(userId, parsed.Description, parsed.InferredCategoryName);
            if (categoryId is null)
            {
                throw new BadInputException("Crie pelo menos uma categoria antes de registrar gastos.");
            }

            var today = ToUtcDate(request.Today ?? DateTime.UtcNow);
            var date = today.AddDays(-daysAgo);

            return await _expenseService.AddExpenseForUserAsync(userId, new CreateExpenseDto
            {
                Description = Capitalize(parsed.Description),
                Amount = parsed.Amount,
                CategoryId = categoryId.Value,
                Date = date,
            });
        }

        public async Task<IReadOnlyList<FrequentExpenseDto>> GetFrequentAsync(int limit)
        {
            var userId = _userContext.GetUserId();
            limit = Math.Clamp(limit, 1, MaxFrequent);
            var since = DateTime.UtcNow.Date.AddDays(-FrequentWindowDays);
            var sinceUtc = DateTime.SpecifyKind(since, DateTimeKind.Utc);

            var recent = await _unitOfWork.Expenses.GetQueryable()
                .AsNoTracking()
                .Where(e => e.UserId == userId && e.RecurringScheduleId == null && e.Date >= sinceUtc)
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.Id)
                .Select(e => new
                {
                    e.Description,
                    e.Amount,
                    e.CategoryId,
                    Category = e.Category != null ? e.Category.Name : string.Empty,
                })
                .Take(500)
                .ToListAsync();

            return recent
                .GroupBy(e => NormalizeKey(e.Description))
                .Where(g => g.Key.Length > 0 && g.Count() >= 2)
                .Select(g =>
                {
                    var latest = g.First();
                    return new FrequentExpenseDto
                    {
                        Description = latest.Description,
                        Amount = latest.Amount,
                        CategoryId = latest.CategoryId,
                        Category = latest.Category,
                        Count = g.Count(),
                    };
                })
                .OrderByDescending(f => f.Count)
                .Take(limit)
                .ToList();
        }

        /// <summary>
        /// Categoria do ultimo gasto com a mesma descricao; senao a categoria
        /// sugerida pelo parser; senao "Outros"; senao a primeira categoria.
        /// </summary>
        private async Task<int?> ResolveCategoryIdAsync(int userId, string description, string inferredCategory)
        {
            var key = NormalizeKey(description);
            var history = await _unitOfWork.Expenses.GetQueryable()
                .AsNoTracking()
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.Id)
                .Select(e => new { e.Description, e.CategoryId })
                .Take(300)
                .ToListAsync();

            var fromHistory = history.FirstOrDefault(e => NormalizeKey(e.Description) == key);
            if (fromHistory is not null)
            {
                return fromHistory.CategoryId;
            }

            var categories = await _unitOfWork.Categories.GetQueryable()
                .AsNoTracking()
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.Id)
                .Select(c => new { c.Id, c.Name })
                .ToListAsync();

            var inferredKey = NormalizeKey(inferredCategory);
            return categories.FirstOrDefault(c => NormalizeKey(c.Name) == inferredKey)?.Id
                ?? categories.FirstOrDefault(c => NormalizeKey(c.Name) == "outros")?.Id
                ?? categories.FirstOrDefault()?.Id;
        }

        internal static (string Text, int DaysAgo) ExtractRelativeDay(string text)
        {
            var daysAgo = 0;
            var kept = new List<string>();
            foreach (var token in text.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            {
                var bare = WhatsAppExpenseMessageParser.RemoveDiacritics(token.Trim('.', ',', '!', '?'));
                if (RelativeDays.TryGetValue(bare, out var offset))
                {
                    daysAgo = offset;
                    continue;
                }
                kept.Add(token);
            }
            return (string.Join(' ', kept), daysAgo);
        }

        internal static string NormalizeKey(string value) =>
            WhatsAppExpenseMessageParser.RemoveDiacritics(value ?? string.Empty)
                .ToLowerInvariant()
                .Trim();

        private static DateTime ToUtcDate(DateTime value) =>
            new(value.Year, value.Month, value.Day, 0, 0, 0, DateTimeKind.Utc);

        private static string Capitalize(string value) =>
            string.IsNullOrEmpty(value) ? value : char.ToUpperInvariant(value[0]) + value[1..];
    }
}
