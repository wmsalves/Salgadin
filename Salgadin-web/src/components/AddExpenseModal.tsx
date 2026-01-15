import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { getCategories, type Category } from "../services/categoryService";
import { addExpense } from "../services/expenseService";
import { motion, AnimatePresence } from "framer-motion";

const expenseSchema = z.object({
  description: z
    .string()
    .min(3, "A descrição deve ter no mínimo 3 caracteres."),
  amount: z.string().min(1, "O valor é obrigatório."),
  date: z.string().nonempty("A data é obrigatória."),
  categoryId: z.string().min(1, "Selecione uma categoria."),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
}: AddExpenseModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (isOpen) {
      getCategories()
        .then(setCategories)
        .catch((err) => console.error("Falha ao buscar categorias", err));
    }
  }, [isOpen]);

  async function onSubmit(data: ExpenseFormValues) {
    setApiError(null);
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount.replace(",", ".")),
        categoryId: parseInt(data.categoryId, 10),
      };

      await addExpense(payload);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Falha ao adicionar despesa:", error);
      setApiError("Não foi possível salvar a despesa. Tente novamente.");
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-slate-900"
          >
            <div className="bg-gradient-to-r from-amber-500 to-emerald-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                Adicionar Nova Despesa
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
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Descrição <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("description")}
                  id="description"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-800 dark:text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 focus:shadow-lg focus:shadow-emerald-100 dark:focus:shadow-emerald-900/30 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Ex: Almoço no restaurante"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Valor (R$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("amount")}
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-800 dark:text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 focus:shadow-lg focus:shadow-emerald-100 dark:focus:shadow-emerald-900/30 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="25,50"
                  />
                  {errors.amount && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("date")}
                    id="date"
                    type="date"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-800 dark:text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 focus:shadow-lg focus:shadow-emerald-100 dark:focus:shadow-emerald-900/30"
                  />
                  {errors.date && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("categoryId")}
                  id="categoryId"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-800 dark:text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 focus:shadow-lg focus:shadow-emerald-100 dark:focus:shadow-emerald-900/30"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {apiError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    {apiError}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Despesa"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
