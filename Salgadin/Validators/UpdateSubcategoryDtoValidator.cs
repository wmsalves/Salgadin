using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class UpdateSubcategoryDtoValidator : AbstractValidator<UpdateSubcategoryDto>
    {
        public UpdateSubcategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da subcategoria é obrigatório.")
                .Length(3, 50).WithMessage("O nome deve ter entre 3 e 50 caracteres.");
        }
    }
}
