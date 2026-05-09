import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "O email é obrigatório.")
    .email("O formato do email é inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "O nome deve ter pelo menos 2 caracteres.")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "O nome deve conter apenas letras."),
    username: z
      .string()
      .min(1, "O email é obrigatório.")
      .email("Por favor, insira um email válido."),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
      .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial."),
    confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório.")
    .email("O formato do email é inválido."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "O token de recuperação é obrigatório."),
    newPassword: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
      .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial."),
    confirmNewPassword: z
      .string()
      .min(1, "A confirmação da nova senha é obrigatória."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmNewPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
