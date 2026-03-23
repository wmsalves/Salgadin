using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class UpdateNotificationPreferenceDtoValidator : AbstractValidator<UpdateNotificationPreferenceDto>
    {
        public UpdateNotificationPreferenceDtoValidator()
        {
            RuleFor(x => x.MinimumThreshold)
                .GreaterThanOrEqualTo(0).WithMessage("O limiar mínimo deve ser >= 0.")
                .LessThanOrEqualTo(1).WithMessage("O limiar mínimo deve ser <= 1.");
        }
    }
}
