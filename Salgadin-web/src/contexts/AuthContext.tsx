import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  updateAuthUser: (token: string) => void;
}

export const AuthContext = createContext({} as AuthContextData);
