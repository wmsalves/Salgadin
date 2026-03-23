using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class CreateSubcategoryDtoValidator : AbstractValidator<CreateSubcategoryDto>
    {
        public CreateSubcategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome da subcategoria é obrigatório.")
                .Length(3, 50).WithMessage("O nome deve ter entre 3 e 50 caracteres.");
        }
    }
}
