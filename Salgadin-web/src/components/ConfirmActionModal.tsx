import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isConfirming?: boolean;
  errorMessage?: string | null;
  tone?: "danger" | "default";
}

export function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
  isConfirming = false,
  errorMessage = null,
  tone = "danger",
}: ConfirmActionModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, isConfirming, onClose]);

  const accentClass =
    tone === "danger"
      ? "bg-danger text-white hover:bg-danger-strong"
      : "bg-primary text-white hover:bg-primary/90";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isConfirming ? onClose : undefined}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 p-6">
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                disabled={isConfirming}
                className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-start gap-4 text-foreground-muted">
                <div className="shrink-0 rounded-full bg-danger/10 p-3 text-danger">
                  <AlertTriangle size={24} />
                </div>
                <p className="text-sm">{description}</p>
              </div>

              {errorMessage && (
                <div className="mb-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isConfirming}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-foreground-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-xl transition",
                    accentClass,
                    isConfirming && "cursor-not-allowed opacity-70",
                  )}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
