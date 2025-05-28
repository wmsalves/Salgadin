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
            CreateMap<Expense, ExpenseDto>().ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : ""));
            CreateMap<UpdateExpenseDto, Expense>();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<Category, CategoryDto>();
        }
    }
}
