import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { getCategories, type Category } from "../services/categoryService";
import { addExpense, updateExpense } from "../services/expenseService";
import { getSubcategories } from "../services/subcategoryService";
import type { Expense, Subcategory } from "../lib/types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatDateForInput, toDateInputValue } from "../lib/dates";
import { getMotionProps, modalMotion, MOTION } from "../lib/motion";

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
  expenseToEdit?: Expense | null;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  expenseToEdit = null,
}: AddExpenseModalProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCategoryTouchedByUser, setIsCategoryTouchedByUser] = useState(false);
  const isEditing = expenseToEdit !== null;

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
      date: formatDateForInput(new Date()),
    },
  });

  useEffect(() => {
    if (isOpen) {
      getCategories()
        .then(setCategories)
        .catch((err) => console.error("Falha ao buscar categorias", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (expenseToEdit) {
      setIsCategoryTouchedByUser(true);
      reset({
        description: expenseToEdit.description,
        amount: Math.abs(expenseToEdit.amount).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        date: toDateInputValue(expenseToEdit.date),
        categoryId: String(expenseToEdit.categoryId),
        subcategoryId: expenseToEdit.subcategoryId
          ? String(expenseToEdit.subcategoryId)
          : "",
      });
      return;
    }

    setIsCategoryTouchedByUser(false);
    reset({
      description: "",
      amount: "",
      date: formatDateForInput(new Date()),
      categoryId: "",
      subcategoryId: "",
    });
  }, [expenseToEdit, isOpen, reset]);

  const selectedCategory = watch("categoryId");
  const descriptionValue = watch("description");

  useEffect(() => {
    if (
      isEditing ||
      isCategoryTouchedByUser ||
      !descriptionValue?.trim() ||
      !categories.length ||
      isSubmitting
    ) {
      return;
    }

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
        setValue("subcategoryId", "");
      }
    }
  }, [
    categories,
    descriptionValue,
    isCategoryTouchedByUser,
    isEditing,
    isSubmitting,
    selectedCategory,
    setValue,
  ]);

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

      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, payload);
      } else {
        await addExpense(payload);
      }
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Falha ao adicionar despesa:", error);
      setApiError("Não foi possível salvar a despesa. Tente novamente.");
    }
  }

  const handleClose = () => {
    setIsCategoryTouchedByUser(false);
    reset({
      description: "",
      amount: "",
      date: formatDateForInput(new Date()),
      categoryId: "",
      subcategoryId: "",
    });
    setApiError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...modalMotion.backdrop}
          transition={shouldReduceMotion ? { duration: 0 } : MOTION.smooth}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        >
          <motion.div
            {...getMotionProps(shouldReduceMotion, modalMotion.panel, {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            })}
            transition={shouldReduceMotion ? { duration: 0 } : MOTION.smooth}
            className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {isEditing ? "Editar Despesa" : "Adicionar Nova Despesa"}
              </h2>
              <button
                onClick={handleClose}
                className="ui-surface-interactive rounded-full p-1 text-white hover:bg-white/20"
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
                          const val = e.target.value.replace(/\D/g, "");
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
                {(() => {
                  const categoryField = register("categoryId");

                  return (
                    <select
                      {...categoryField}
                      id="categoryId"
                      className="w-full rounded-xl border border-border px-4 py-3 bg-surface text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40 focus:border-primary focus:shadow-lg focus:shadow-[rgba(var(--shadow-color),0.12)]"
                      onChange={(event) => {
                        const nextCategoryId = event.target.value;
                        const categoryChanged = nextCategoryId !== selectedCategory;

                        categoryField.onChange(event);

                        if (categoryChanged) {
                          setValue("subcategoryId", "");
                        }

                        setIsCategoryTouchedByUser(true);
                      }}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  );
                })()}
                {!isEditing && !isCategoryTouchedByUser && selectedCategory && (
                  <p className="mt-2 text-xs text-foreground-subtle">
                    Categoria sugerida automaticamente. VocÃª pode alterar antes
                    de salvar.
                  </p>
                )}
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
                  {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alteracoes" : "Salvar Despesa"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
