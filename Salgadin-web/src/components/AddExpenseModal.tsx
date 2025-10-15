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
      // 2. CORREÇÃO: Convertemos as strings para números AQUI, no momento do envio.
      // Isso é explícito, claro e o TypeScript entende perfeitamente.
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
          className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Adicionar Nova Despesa</h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-gray-500 hover:bg-slate-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* O JSX do formulário não precisa de nenhuma mudança */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Descrição
                </label>
                <input
                  {...register("description")}
                  id="description"
                  type="text"
                  className="mt-1 w-full rounded-xl border px-4 py-3 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Almoço"
                />
                {errors.description && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Valor (R$)
                  </label>
                  <input
                    {...register("amount")}
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    className="mt-1 w-full rounded-xl border px-4 py-3 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="25,50"
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Data
                  </label>
                  <input
                    {...register("date")}
                    id="date"
                    type="date"
                    className="mt-1 w-full rounded-xl border px-4 py-3 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.date && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-slate-700"
                >
                  Categoria
                </label>
                <select
                  {...register("categoryId")}
                  id="categoryId"
                  className="mt-1 w-full rounded-xl border px-4 py-3 bg-[#faf7df] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {apiError && (
                <p className="text-sm text-red-600 text-center">{apiError}</p>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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
