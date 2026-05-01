using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Salgadin.DTOs;
using Salgadin.Exceptions;
using Salgadin.Models;
using Salgadin.Repositories;

namespace Salgadin.Services
{
    public class IncomeService : IIncomeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContextService;

        public IncomeService(IUnitOfWork unitOfWork, IMapper mapper, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userContextService = userContextService;
        }

        public async Task<IncomeDto?> GetIncomeByIdAsync(int id)
        {
            var userId = _userContextService.GetUserId();
            var income = await _unitOfWork.Incomes.GetQueryable()
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

            return income == null ? null : _mapper.Map<IncomeDto>(income);
        }

        public async Task<PagedResult<IncomeDto>> GetPagedAsync(
            int pageNumber,
            int pageSize,
            DateTime? startDate = null,
            DateTime? endDate = null,
            bool? isFixed = null)
        {
            var userId = _userContextService.GetUserId();
            var query = _unitOfWork.Incomes.GetQueryable()
                .Where(i => i.UserId == userId);

            var normalizedStartDate = startDate.HasValue
                ? DateOnlyNormalizer.Normalize(startDate.Value)
                : (DateTime?)null;
            var normalizedEndDate = endDate.HasValue
                ? DateOnlyNormalizer.Normalize(endDate.Value)
                : (DateTime?)null;

            if (normalizedStartDate.HasValue || normalizedEndDate.HasValue)
            {
                query = query.Where(i =>
                    i.IsFixed
                        ? (!normalizedEndDate.HasValue || i.Date.Date <= normalizedEndDate.Value.Date)
                        : (!normalizedStartDate.HasValue || i.Date.Date >= normalizedStartDate.Value.Date) &&
                          (!normalizedEndDate.HasValue || i.Date.Date <= normalizedEndDate.Value.Date));
            }
            if (isFixed.HasValue)
                query = query.Where(i => i.IsFixed == isFixed.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(i => i.Date)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<IncomeDto>>(items);

            return new PagedResult<IncomeDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<IncomeDto> AddIncomeAsync(CreateIncomeDto incomeDto)
        {
            var userId = _userContextService.GetUserId();
            var income = _mapper.Map<Income>(incomeDto);
            income.UserId = userId;
            income.Date = DateOnlyNormalizer.Normalize(income.Date);

            await _unitOfWork.Incomes.AddAsync(income);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<IncomeDto>(income);
        }

        public async Task UpdateIncomeAsync(int id, UpdateIncomeDto incomeDto)
        {
            var userId = _userContextService.GetUserId();
            var income = await _unitOfWork.Incomes.GetQueryable()
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

            if (income == null)
                throw new NotFoundException("Receita não encontrada.");

            _mapper.Map(incomeDto, income);
            income.Date = DateOnlyNormalizer.Normalize(income.Date);

            _unitOfWork.Incomes.Update(income);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteIncomeAsync(int id)
        {
            var userId = _userContextService.GetUserId();
            var income = await _unitOfWork.Incomes.GetQueryable()
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

            if (income == null)
                throw new NotFoundException("Receita não encontrada.");

            _unitOfWork.Incomes.Delete(income);
            await _unitOfWork.CompleteAsync();
        }
    }
}
