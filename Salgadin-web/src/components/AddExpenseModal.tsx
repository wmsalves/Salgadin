import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { getCategories, type Category } from "../services/categoryService";
import {
  addExpense,
  updateExpense,
  type CreateExpenseData,
} from "../services/expenseService";
import { getSubcategories } from "../services/subcategoryService";
import type { Expense, RecurringSchedule, Subcategory } from "../lib/types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatDateForInput, toDateInputValue } from "../lib/dates";
import { getMotionProps, modalMotion, MOTION } from "../lib/motion";
import { findMatchingRecurringSchedule } from "../lib/recurringSchedules";

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
  recurringSchedules?: RecurringSchedule[];
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  expenseToEdit = null,
  recurringSchedules = [],
}: AddExpenseModalProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCategoryTouchedByUser, setIsCategoryTouchedByUser] = useState(false);
  const [matchingSchedule, setMatchingSchedule] =
    useState<RecurringSchedule | null>(null);
  const [pendingPayload, setPendingPayload] =
    useState<CreateExpenseData | null>(null);
  const [isLinkingRecurring, setIsLinkingRecurring] = useState(false);
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
  const amountValue = watch("amount");
  const dateValue = watch("date");

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

  useEffect(() => {
    if (!matchingSchedule || !pendingPayload) {
      return;
    }

    const currentAmount = parseFloat(amountValue.replace(/\./g, "").replace(",", "."));
    const formChanged =
      descriptionValue !== pendingPayload.description ||
      dateValue !== pendingPayload.date ||
      selectedCategory !== String(pendingPayload.categoryId) ||
      currentAmount !== pendingPayload.amount;

    if (formChanged) {
      setMatchingSchedule(null);
      setPendingPayload(null);
    }
  }, [
    amountValue,
    dateValue,
    descriptionValue,
    matchingSchedule,
    pendingPayload,
    selectedCategory,
  ]);

  async function onSubmit(data: ExpenseFormValues) {
    setApiError(null);
    try {
      const payload: CreateExpenseData = {
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
        const match = findMatchingRecurringSchedule({
          schedules: recurringSchedules,
          type: "Expense",
          description: payload.description,
          amount: payload.amount,
          categoryId: payload.categoryId,
          date: payload.date,
        });

        if (match) {
          setMatchingSchedule(match);
          setPendingPayload(payload);
          return;
        }

        await saveNewExpense(payload);
      }
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Falha ao adicionar despesa:", error);
      setApiError("Não foi possível salvar a despesa. Tente novamente.");
    }
  }

  const saveNewExpense = async (payload: CreateExpenseData) => {
    await addExpense(payload);
  };

  const handleRecurringLinkChoice = async (shouldLink: boolean) => {
    if (!pendingPayload) {
      return;
    }

    setIsLinkingRecurring(true);
    setApiError(null);
    try {
      await saveNewExpense({
        ...pendingPayload,
        recurringScheduleId: shouldLink ? matchingSchedule?.id : null,
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Falha ao vincular despesa recorrente:", error);
      setApiError("Não foi possível salvar a despesa. Tente novamente.");
    } finally {
      setIsLinkingRecurring(false);
    }
  };

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
    setMatchingSchedule(null);
    setPendingPayload(null);
    setIsLinkingRecurring(false);
    onClose();
  };

  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...modalMotion.backdrop}
          transition={shouldReduceMotion ? { duration: 0 } : MOTION.smooth}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleClose();
          }}
        >
          <motion.div
            {...getMotionProps(shouldReduceMotion, modalMotion.panel, {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            })}
            transition={shouldReduceMotion ? { duration: 0 } : MOTION.smooth}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-overlay)] sm:rounded-2xl sm:pb-0"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 pb-4 pt-5">
              <div>
                <h2 id="{titleId}" className="text-lg font-medium text-foreground">
                  {isEditing ? "Editar despesa" : "Nova despesa"}
                </h2>
                <p className="mt-0.5 text-ui text-foreground-muted">{isEditing ? "Ajuste os dados do lançamento." : "Café, lanche, mercado ou qualquer gasto do dia."}</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar"
                className="-mr-2 -mt-1 grid h-9 w-9 place-items-center rounded-lg text-foreground-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="amount"
                    className="mb-1.5 block text-ui text-foreground-muted"
                  >
                    Valor (R$) <span className="text-danger" aria-hidden>*</span>
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
                    className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2 text-2xl font-medium tabular-nums text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25 placeholder:text-foreground-subtle"
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
                    className="mb-1.5 block text-ui text-foreground-muted"
                  >
                    Data <span className="text-danger" aria-hidden>*</span>
                  </label>
                  <input
                    {...register("date")}
                    id="date"
                    type="date"
                    className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                  htmlFor="description"
                  className="mb-1.5 block text-ui text-foreground-muted"
                >
                  Descrição <span className="text-danger" aria-hidden>*</span>
                </label>
                <input
                  {...register("description")}
                  id="description"
                  type="text"
                  className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25 placeholder:text-foreground-subtle"
                  placeholder="Ex.: café na padaria"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-danger font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>


              <div>
                <label
                  htmlFor="categoryId"
                  className="mb-1.5 block text-ui text-foreground-muted"
                >
                  Categoria <span className="text-danger" aria-hidden>*</span>
                </label>
                {(() => {
                  const categoryField = register("categoryId");

                  return (
                    <select
                      {...categoryField}
                      id="categoryId"
                      className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                    Categoria sugerida automaticamente. Você pode alterar antes
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
                  className="mb-1.5 block text-ui text-foreground-muted"
                >
                  Subcategoria
                </label>
                <select
                  {...register("subcategoryId")}
                  id="subcategoryId"
                  className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
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

              {matchingSchedule && pendingPayload && (
                <div className="rounded-2xl border border-primary/24 bg-primary/10 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Esta despesa parece fazer parte de uma recorrência.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground-muted">
                    Deseja vincular este lançamento a "{matchingSchedule.description}"?
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleRecurringLinkChoice(false)}
                      disabled={isLinkingRecurring}
                      size="sm"
                    >
                      Ignorar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleRecurringLinkChoice(true)}
                      isLoading={isLinkingRecurring}
                      size="sm"
                    >
                      Vincular
                    </Button>
                  </div>
                </div>
              )}

              {apiError && (
                <div className="p-3 rounded-xl bg-surface-2 border border-danger/30">
                  <p className="text-sm text-danger font-medium">
                    {apiError}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Salvar despesa"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
