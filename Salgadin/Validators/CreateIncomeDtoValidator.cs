using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class CreateIncomeDtoValidator : AbstractValidator<CreateIncomeDto>
    {
        public CreateIncomeDtoValidator()
        {
            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("A descrição é obrigatória.")
                .MaximumLength(255).WithMessage("A descrição não pode ter mais de 255 caracteres.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("O valor da receita deve ser maior que zero.");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("A data é obrigatória.");
        }
    }
}
