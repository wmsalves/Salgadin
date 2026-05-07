import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { getMotionProps, modalMotion, MOTION } from "../lib/motion";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  categoryName: string;
  isDeleting: boolean;
  errorStr: string | null;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isDeleting,
  errorStr
}: DeleteCategoryModalProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            {...modalMotion.backdrop}
            transition={shouldReduceMotion ? { duration: 0 } : MOTION.smooth}
            onClick={!isDeleting ? onClose : undefined}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            {...getMotionProps(shouldReduceMotion, modalMotion.panel, {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            })}
            transition={shouldReduceMotion ? { duration: 0 } : MOTION.smooth}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border border-border/70 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 p-6">
              <h2 className="text-xl font-bold text-foreground">
                Excluir Categoria
              </h2>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="ui-surface-interactive rounded-full p-2 text-foreground-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6 text-foreground-muted">
                 <div className="bg-danger/10 text-danger p-3 rounded-full shrink-0">
                    <AlertTriangle size={24} />
                 </div>
                 <div>
                    <p className="text-sm">
                      Você está prestes a excluir permanentemente a categoria <strong className="text-foreground">{categoryName}</strong>.
                    </p>
                    <p className="text-xs mt-2">Esta ação não poderá ser desfeita. Caso a categoria possua despesas atreladas, a exclusão será bloqueada.</p>
                 </div>
              </div>

              {errorStr && (
                  <div className="ui-status-message mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-sm text-danger font-medium flex gap-2 items-start">
                     <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                     <p>{errorStr}</p>
                  </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                 <button
                   onClick={onClose}
                   disabled={isDeleting}
                   className="ui-surface-interactive px-5 py-2.5 rounded-full text-sm font-semibold text-foreground-muted hover:bg-surface-2 disabled:opacity-50"
                 >
                   Cancelar
                 </button>
                 <button
                   onClick={onConfirm}
                   disabled={isDeleting}
                   className={clsx(
                     "ui-pressable px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-xl flex items-center gap-2",
                     isDeleting ? "bg-danger/70 cursor-not-allowed" : "bg-danger hover:bg-danger-strong hover:shadow-danger/30"
                   )}
                 >
                   {isDeleting ? (
                       <>
                         <Loader2 size={16} className="animate-spin" />
                         Excluindo...
                       </>
                   ) : "Sim, Excluir"}
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
