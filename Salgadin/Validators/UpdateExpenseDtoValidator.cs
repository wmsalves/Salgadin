using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class UpdateExpenseDtoValidator : AbstractValidator<UpdateExpenseDto>
    {
        public UpdateExpenseDtoValidator()
        {
            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("A descrição é obrigatória.")
                .MaximumLength(100).WithMessage("A descrição não pode exceder 100 caracteres.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("O valor da despesa deve ser maior que zero.");

            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("O ID da categoria é obrigatório.");

            RuleFor(x => x.SubcategoryId)
                .GreaterThan(0)
                .When(x => x.SubcategoryId.HasValue)
                .WithMessage("O ID da subcategoria deve ser válido.");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("A data é obrigatória.")
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("A data da despesa não pode ser no futuro.");
        }
    }
}
