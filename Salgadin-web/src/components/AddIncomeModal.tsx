import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { addIncome } from "../services/incomeService";
import { motion, AnimatePresence } from "framer-motion";

const incomeSchema = z.object({
  description: z.string().min(3, "A descrição deve ter no mínimo 3 caracteres."),
  amount: z.string().min(1, "O valor é obrigatório."),
  date: z.string().min(1, "A data é obrigatória."),
  isFixed: z.boolean(),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddIncomeModal({
  isOpen,
  onClose,
  onSuccess,
}: AddIncomeModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      isFixed: false,
    },
  });

  async function onSubmit(data: IncomeFormValues) {
    setApiError(null);
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount.replace(",", ".")),
      };

      await addIncome(payload);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Falha ao adicionar receita:", error);
      setApiError("Não foi possível salvar a receita. Tente novamente.");
    }
  }

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                Nova Receita
              </h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="descriptionIncome"
                  className="block text-sm font-semibold text-foreground-muted mb-2"
                >
                  Descrição da Receita <span className="text-danger">*</span>
                </label>
                <input
                  {...register("description")}
                  id="descriptionIncome"
                  type="text"
                  className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:shadow-lg placeholder:text-foreground-subtle"
                  placeholder="Ex: Salário, Rendimentos, Pix..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-danger font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="amountIncome"
                    className="block text-sm font-semibold text-foreground-muted mb-2"
                  >
                    Valor (R$) <span className="text-danger">*</span>
                  </label>
                  <input
                    {...register("amount")}
                    id="amountIncome"
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:shadow-lg placeholder:text-foreground-subtle"
                    placeholder="2500,00"
                  />
                  {errors.amount && (
                    <p className="mt-2 text-sm text-danger font-medium">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="dateIncome"
                    className="block text-sm font-semibold text-foreground-muted mb-2"
                  >
                    Data <span className="text-danger">*</span>
                  </label>
                  <input
                    {...register("date")}
                    id="dateIncome"
                    type="date"
                    className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:shadow-lg"
                  />
                  {errors.date && (
                    <p className="mt-2 text-sm text-danger font-medium">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isFixed"
                  {...register("isFixed")}
                  className="h-5 w-5 rounded border-border text-emerald-500 focus:ring-emerald-500/40"
                />
                <label
                  htmlFor="isFixed"
                  className="text-sm font-medium text-foreground-muted"
                >
                  Esta é uma renda fixa / recorrente
                </label>
              </div>

              {apiError && (
                <div className="p-3 rounded-xl bg-surface-2 border border-danger/30">
                  <p className="text-sm text-danger font-medium">
                    {apiError}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 disabled:opacity-70"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Receita"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
