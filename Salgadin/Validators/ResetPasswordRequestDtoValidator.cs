using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators;

public class ResetPasswordRequestDtoValidator : AbstractValidator<ResetPasswordRequestDto>
{
    public ResetPasswordRequestDtoValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("O token de recuperação é obrigatório.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("A nova senha é obrigatória.")
            .MinimumLength(8).WithMessage("A nova senha deve ter no mínimo 8 caracteres.")
            .Matches("[A-Z]").WithMessage("A nova senha deve conter pelo menos uma letra maiúscula.")
            .Matches("[a-z]").WithMessage("A nova senha deve conter pelo menos uma letra minúscula.")
            .Matches("[0-9]").WithMessage("A nova senha deve conter pelo menos um número.")
            .Matches("[^a-zA-Z0-9]").WithMessage("A nova senha deve conter pelo menos um caractere especial.");

        RuleFor(x => x.ConfirmNewPassword)
            .NotEmpty().WithMessage("A confirmação da nova senha é obrigatória.")
            .Equal(x => x.NewPassword).WithMessage("A confirmação da nova senha não coincide.");
    }
}
