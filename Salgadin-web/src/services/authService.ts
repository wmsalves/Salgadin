import { api } from "./api";
import { type LoginFormValues, type SignupFormValues } from "../lib/schemas";

type RegisterPayload = SignupFormValues;

interface AuthResponse {
  token: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phoneNumber?: string | null;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

interface UpdateProfileResponse {
  token: string;
  profile: UserProfile;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LoginFormValues) => {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
};

export const loginWithGoogle = async (idToken: string) => {
  const response = await api.post<AuthResponse>("/auth/google", { idToken });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get<UserProfile>("/auth/me");
  return response.data;
};

export const updateMyProfile = async (data: UpdateProfileData) => {
  const response = await api.put<UpdateProfileResponse>("/auth/me", data);
  return response.data;
};
