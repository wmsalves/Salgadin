import { useContext } from "react";
import { AuthContext, type AuthContextData } from "../contexts/AuthContext";

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
