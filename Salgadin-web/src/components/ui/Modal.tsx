import { useEffect, useId, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { MOTION, modalMotion } from "../../lib/motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Largura maxima do painel. */
  size?: "md" | "lg";
}

/**
 * Dialogo padrao do app: cabecalho neutro, fecha com Esc ou clique fora,
 * vira "gaveta" de baixo no celular.
 */
export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...modalMotion.backdrop}
          transition={reduceMotion ? { duration: 0 } : MOTION.smooth}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            {...(reduceMotion
              ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
              : modalMotion.panel)}
            transition={reduceMotion ? { duration: 0 } : MOTION.smooth}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-overlay)] sm:rounded-2xl sm:pb-0 ${
              size === "lg" ? "max-w-xl" : "max-w-md"
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 pb-4 pt-5">
              <div>
                <h2 id={titleId} className="text-lg font-medium text-foreground">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-ui text-foreground-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-2 -mt-1 grid h-9 w-9 place-items-center rounded-lg text-foreground-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 pb-6 pt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

