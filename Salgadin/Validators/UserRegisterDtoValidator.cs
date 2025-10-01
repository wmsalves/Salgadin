using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class UserRegisterDtoValidator : AbstractValidator<UserRegisterDto>
    {
        public UserRegisterDtoValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("O nome de usuário é obrigatório.")
                .Length(3, 50).WithMessage("O nome de usuário deve ter entre 3 e 50 caracteres.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("A senha é obrigatória.")
                .MinimumLength(8).WithMessage("A senha deve ter no mínimo 8 caracteres.")
                .Matches("[A-Z]").WithMessage("A senha deve conter pelo menos uma letra maiúscula.")
                .Matches("[a-z]").WithMessage("A senha deve conter pelo menos uma letra minúscula.")
                .Matches("[0-9]").WithMessage("A senha deve conter pelo menos um número.");
        }
    }
}