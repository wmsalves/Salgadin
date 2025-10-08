import { useState, useCallback, useEffect, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";
import { api } from "../services/api";

function parseJwt(token: string): User {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  const payload = JSON.parse(jsonPayload);
  return { id: payload.nameid, name: payload.unique_name };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((newToken: string) => {
    const decodedUser = parseJwt(newToken);
    localStorage.setItem("@Salgadin:token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setUser(decodedUser);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("@Salgadin:token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("@Salgadin:token");
    if (storedToken) {
      login(storedToken);
    }
    setIsLoading(false);
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
