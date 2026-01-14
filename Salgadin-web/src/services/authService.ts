import { api } from "./api";
import { type LoginFormValues, type SignupFormValues } from "../lib/schemas";

type RegisterPayload = Omit<SignupFormValues, "confirmPassword">;

interface AuthResponse {
  token: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LoginFormValues) => {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
};
