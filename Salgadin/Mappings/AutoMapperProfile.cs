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
            CreateMap<CreateExpenseDto, Expense>()
                .ForMember(dest => dest.Date, opt =>
                    opt.MapFrom(src => DateTime.SpecifyKind(src.Date, DateTimeKind.Utc))
                );

            CreateMap<UpdateExpenseDto, Expense>()
                .ForMember(dest => dest.Date, opt =>
                    opt.MapFrom(src => DateTime.SpecifyKind(src.Date, DateTimeKind.Utc))
                );
            CreateMap<Expense, ExpenseDto>()
                .ForMember(dest => dest.CategoryId,
                    opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.Category,
                     opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : ""))
                .ForMember(dest => dest.SubcategoryId,
                    opt => opt.MapFrom(src => src.SubcategoryId))
                .ForMember(dest => dest.Subcategory,
                    opt => opt.MapFrom(src => src.Subcategory != null ? src.Subcategory.Name : null))
                .ForMember(dest => dest.Date,
                    opt => opt.MapFrom(src => DateTime.SpecifyKind(src.Date, DateTimeKind.Utc)));
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateSubcategoryDto, Subcategory>();
            CreateMap<Subcategory, SubcategoryDto>();

            CreateMap<CreateIncomeDto, Income>()
                .ForMember(dest => dest.Date, opt =>
                    opt.MapFrom(src => DateTime.SpecifyKind(src.Date, DateTimeKind.Utc))
                );
            CreateMap<UpdateIncomeDto, Income>()
                .ForMember(dest => dest.Date, opt =>
                    opt.MapFrom(src => DateTime.SpecifyKind(src.Date, DateTimeKind.Utc))
                );
            CreateMap<Income, IncomeDto>()
                .ForMember(dest => dest.Date,
                    opt => opt.MapFrom(src => DateTime.SpecifyKind(src.Date, DateTimeKind.Utc)));
        }
    }
}
