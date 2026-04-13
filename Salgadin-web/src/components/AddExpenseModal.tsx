import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { getCategories, type Category } from "../services/categoryService";
import { addExpense } from "../services/expenseService";
import { getSubcategories } from "../services/subcategoryService";
import type { Subcategory } from "../lib/types";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Alimentação": ['ifood', 'uber eats', 'rappi', 'restaurante', 'mercado', 'padaria', 'açougue', 'supermercado', 'hortifruti', 'mcdonalds', "mcdonald's", 'burguer king', 'habibs', 'pizza', 'sushi', 'lanche', 'café', 'padoca', 'extra', 'carrefour', 'pão de açúcar', 'assaí', 'atacadão'],
  "Transporte": ['uber', '99', 'taxi', 'táxi', 'metrô', 'metro', 'ônibus', 'onibus', 'gasolina', 'posto', 'etanol', 'diesel', 'estacionamento', 'pedágio', 'pedagio', 'blablacar', 'trem', 'cptm', 'bilhete', 'top', 'recarga'],
  "Moradia": ['aluguel', 'condomínio', 'iptu', 'luz', 'enel', 'eletropaulo', 'cemig', 'água', 'sabesp', 'copasa', 'gás', 'gas', 'internet', 'vivo', 'claro', 'tim', 'oi', 'net', 'tv', 'streaming'],
  "Saúde": ['farmácia', 'farmacia', 'drogaria', 'droga raia', 'drogasil', 'pacheco', 'médico', 'medica', 'consulta', 'exame', 'laboratório', 'academia', 'smartfit', 'bluefit', 'suplemento', 'growth', 'vitamina', 'dentista', 'plano de saúde', 'unimed', 'amil', 'bradesco saúde', 'psicólogo', 'terapia'],
  "Educação": ['escola', 'faculdade', 'curso', 'udemy', 'alura', 'rocketseat', 'livro', 'mensalidade', 'material', 'univesp', 'enem', 'vestibular'],
  "Lazer": ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'cinema', 'teatro', 'show', 'ingresso', 'steam', 'playstation', 'xbox', 'nintendo', 'jogo', 'viagem', 'hotel', 'airbnb', 'booking', 'passeio'],
  "Assinaturas": ['spotify', 'netflix', 'amazon', 'prime', 'disney+', 'hbo max', 'apple', 'google one', 'icloud', 'm365', 'office 365', 'adobe', 'canva', 'dropbox'],
  "Pets": ['petz', 'cobasi', 'veterinário', 'ração', 'pet shop', 'banho', 'tosa']
};

const expenseSchema = z.object({
  description: z
    .string()
    .min(3, "A descrição deve ter no mínimo 3 caracteres."),
  amount: z.string().min(1, "O valor é obrigatório."),
  date: z.string().nonempty("A data é obrigatória."),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  subcategoryId: z.string().optional(),
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
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
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

  const selectedCategory = watch("categoryId");
  const descriptionValue = watch("description");

  useEffect(() => {
    if (!descriptionValue || !categories.length || isSubmitting) return;
    const lowerDesc = descriptionValue.toLowerCase();
    let foundCategoryName: string | null = null;
    
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => lowerDesc.includes(k))) {
        foundCategoryName = catName;
        break;
      }
    }
    
    if (foundCategoryName) {
      const matchCat = categories.find(c => c.name === foundCategoryName);
      if (matchCat && selectedCategory !== String(matchCat.id)) {
        setValue("categoryId", String(matchCat.id), { shouldValidate: true });
      }
    }
  }, [descriptionValue, categories, setValue, selectedCategory, isSubmitting]);

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      return;
    }
    const categoryId = parseInt(selectedCategory, 10);
    getSubcategories(categoryId)
      .then(setSubcategories)
      .catch((err) => {
        console.error("Falha ao buscar subcategorias", err);
        setSubcategories([]);
      });
  }, [selectedCategory]);

  async function onSubmit(data: ExpenseFormValues) {
    setApiError(null);
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount.replace(/\./g, "").replace(",", ".")),
        categoryId: parseInt(data.categoryId, 10),
        subcategoryId: data.subcategoryId
          ? parseInt(data.subcategoryId, 10)
          : undefined,
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
            className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-6 py-4 flex justify-between items-center">
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
                  className="block text-sm font-semibold text-foreground-muted mb-2"
                >
                  Descrição <span className="text-danger">*</span>
                </label>
                <input
                  {...register("description")}
                  id="description"
                  type="text"
                  className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40 focus:border-primary focus:shadow-lg focus:shadow-[rgba(var(--shadow-color),0.12)] placeholder:text-foreground-subtle"
                  placeholder="Ex: Almoço no restaurante"
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
                    htmlFor="amount"
                    className="block text-sm font-semibold text-foreground-muted mb-2"
                  >
                    Valor (R$) <span className="text-danger">*</span>
                  </label>
                  <input
                    {...(() => {
                      const { onChange, ...rest } = register("amount");
                      return {
                        ...rest,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (!val) {
                            e.target.value = "";
                          } else {
                            const numericValue = parseInt(val, 10) / 100;
                            e.target.value = numericValue.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                          }
                          onChange(e);
                        }
                      }
                    })()}
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    className="w-full font-mono tabular-nums rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40 focus:border-primary focus:shadow-lg focus:shadow-[rgba(var(--shadow-color),0.12)] placeholder:text-foreground-subtle"
                    placeholder="0,00"
                  />
                  {errors.amount && (
                    <p className="mt-2 text-sm text-danger font-medium">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-semibold text-foreground-muted mb-2"
                  >
                    Data <span className="text-danger">*</span>
                  </label>
                  <input
                    {...register("date")}
                    id="date"
                    type="date"
                    className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40 focus:border-primary focus:shadow-lg focus:shadow-[rgba(var(--shadow-color),0.12)]"
                  />
                  {errors.date && (
                    <p className="mt-2 text-sm text-danger font-medium">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-semibold text-foreground-muted mb-2"
                >
                  Categoria <span className="text-danger">*</span>
                </label>
                <select
                  {...register("categoryId")}
                  id="categoryId"
                  className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40 focus:border-primary focus:shadow-lg focus:shadow-[rgba(var(--shadow-color),0.12)]"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-2 text-sm text-danger font-medium">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subcategoryId"
                  className="block text-sm font-semibold text-foreground-muted mb-2"
                >
                  Subcategoria
                </label>
                <select
                  {...register("subcategoryId")}
                  id="subcategoryId"
                  className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40 focus:border-primary focus:shadow-lg focus:shadow-[rgba(var(--shadow-color),0.12)]"
                  disabled={!selectedCategory || subcategories.length === 0}
                >
                  <option value="">
                    {selectedCategory
                      ? subcategories.length > 0
                        ? "Selecione uma subcategoria (opcional)"
                        : "Nenhuma subcategoria encontrada"
                      : "Selecione uma categoria primeiro"}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
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


