using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators;

public class ForgotPasswordRequestDtoValidator : AbstractValidator<ForgotPasswordRequestDto>
{
    public ForgotPasswordRequestDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O email é obrigatório.")
            .EmailAddress().WithMessage("O email informado é inválido.")
            .Length(5, 100).WithMessage("O email deve ter entre 5 e 100 caracteres.");
    }
}
