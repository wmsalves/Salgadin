using AutoMapper;
using Salgadin.DTOs;
using Salgadin.Models;

namespace Salgadin.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<CreateExpenseDto, Expense>();
            CreateMap<ExpenseDto, Expense>().ReverseMap();
            CreateMap<UpdateExpenseDto, Expense>();
        }
    }
}
