using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class CreateGoalDtoValidator : AbstractValidator<CreateGoalDto>
    {
        public CreateGoalDtoValidator()
        {
            RuleFor(x => x.MonthlyLimit)
                .GreaterThan(0).WithMessage("O limite mensal deve ser maior que zero.");

            RuleFor(x => x.AlertThreshold)
                .GreaterThan(0).WithMessage("O limiar deve ser maior que zero.")
                .LessThanOrEqualTo(1).WithMessage("O limiar deve ser menor ou igual a 1.");
        }
    }
}
