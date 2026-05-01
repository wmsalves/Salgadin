using FluentValidation;
using Salgadin.DTOs;

namespace Salgadin.Validators
{
    public class UpdateUserProfileDtoValidator : AbstractValidator<UpdateUserProfileDto>
    {
        public UpdateUserProfileDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome é obrigatório.")
                .Length(3, 100).WithMessage("O nome deve ter entre 3 e 100 caracteres.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("O email é obrigatório.")
                .EmailAddress().WithMessage("O email informado é inválido.")
                .Length(5, 100).WithMessage("O email deve ter entre 5 e 100 caracteres.");

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^\(\d{2}\)\s\d{4,5}-\d{4}$").When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
                .WithMessage("O telefone deve estar no formato (31) 98888-8888.");

            When(x => !string.IsNullOrWhiteSpace(x.NewPassword), () =>
            {
                RuleFor(x => x.CurrentPassword)
                    .NotEmpty().WithMessage("A senha atual é obrigatória para alterar email ou senha.");

                RuleFor(x => x.NewPassword!)
                    .MinimumLength(8).WithMessage("A nova senha deve ter no mínimo 8 caracteres.")
                    .Matches("[A-Z]").WithMessage("A nova senha deve conter pelo menos uma letra maiúscula.")
                    .Matches("[a-z]").WithMessage("A nova senha deve conter pelo menos uma letra minúscula.")
                    .Matches("[0-9]").WithMessage("A nova senha deve conter pelo menos um número.")
                    .Matches("[^a-zA-Z0-9]").WithMessage("A nova senha deve conter pelo menos um caractere especial.");

                RuleFor(x => x.ConfirmNewPassword)
                    .Equal(x => x.NewPassword)
                    .WithMessage("A confirmação da nova senha não coincide.");
            });
        }
    }
}
