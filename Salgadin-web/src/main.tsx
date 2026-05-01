import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./styles/index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const appContent = (
  <ThemeProvider>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{appContent}</GoogleOAuthProvider>
    ) : (
      appContent
    )}
  </StrictMode>
);
