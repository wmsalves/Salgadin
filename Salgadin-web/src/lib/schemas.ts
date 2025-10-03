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
    username: z
      .string()
      .min(1, "O email é obrigatório.")
      .email("Por favor, insira um email válido."),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número."),
    confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
