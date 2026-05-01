import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { loginWithGoogle } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

interface GoogleAuthButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

export function GoogleAuthButton({
  text = "continue_with",
}: GoogleAuthButtonProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!googleClientId) {
    return null;
  }

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      setError("Não foi possível obter a credencial do Google.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const authResponse = await loginWithGoogle(response.credential);
      login(authResponse.token);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Não foi possível entrar com Google agora. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={isLoading ? "pointer-events-none opacity-70" : undefined}
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() =>
            setError("Não foi possível iniciar o login com Google.")
          }
          text={text}
          theme="outline"
          size="large"
          shape="pill"
          logo_alignment="left"
          width="100%"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-surface-2 px-3 py-2 text-sm text-foreground-muted">
          <LogIn size={16} className="text-primary" />
          Validando sua conta Google...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-danger/30 bg-surface-2 px-3 py-2">
          <p className="text-sm text-danger text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
