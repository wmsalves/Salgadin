using Salgadin.DTOs;
using Salgadin.Models;

namespace Salgadin.Services
{
    public interface IExpenseService
    {
        // Listagem simples (ainda útil em alguns cenários; você também tem a versão paginada)
        Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync();

        // Listagem com filtros básicos (sem paginação)
        Task<IEnumerable<ExpenseDto>> GetFilteredExpensesAsync(DateTime? startDate, DateTime? endDate, string? category);

        // Buscar por ID (retorna DTO)
        Task<ExpenseDto?> GetExpenseByIdAsync(int id);

        // Criar (retorna o DTO criado para usar em CreatedAtAction)
        Task<ExpenseDto> AddExpenseAsync(CreateExpenseDto dto);

        // Atualizar e excluir (sem retorno; use 204 NoContent)
        Task UpdateExpenseAsync(int id, UpdateExpenseDto dto);
        Task DeleteExpenseAsync(int id);

        // Resumo diário (para gráficos e visão agregada)
        Task<IEnumerable<DailySummaryDto>> GetDailySummaryAsync(DateTime? startDate, DateTime? endDate);

        // Listagem paginada com filtros (para telas com paginação)
        Task<PagedResult<ExpenseDto>> GetPagedAsync(int page, int pageSize, DateTime? startDate, DateTime? endDate, string? category);
    }
}
