import { Component, type ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    console.error("Error caught by ErrorBoundary:", error);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] flex items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-danger/30 bg-surface shadow-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-danger/10">
                <AlertCircle className="text-danger" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-danger">Oops!</h1>
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-2">
              Algo deu errado
            </h2>
            <p className="text-foreground-muted text-sm mb-6">
              Desculpe, encontramos um erro inesperado. Tente novamente ou
              retorne à página inicial.
            </p>

            {import.meta.env.DEV && (
              <details className="mb-6 p-3 bg-surface-2 rounded-lg text-xs">
                <summary className="cursor-pointer font-semibold text-foreground-muted mb-2">
                  Detalhes do erro
                </summary>
                <pre className="text-danger overflow-auto max-h-32 whitespace-pre-wrap break-words">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-strong text-white font-semibold py-3 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Voltar para home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


