import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import {
  addIncome,
  updateIncome,
  type CreateIncomeData,
} from "../services/incomeService";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Income, RecurringSchedule } from "../lib/types";
import { formatDateForInput, toDateInputValue } from "../lib/dates";
import { getMotionProps, modalMotion, MOTION } from "../lib/motion";
import { findMatchingRecurringSchedule } from "../lib/recurringSchedules";

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
  incomeToEdit?: Income | null;
  recurringSchedules?: RecurringSchedule[];
}

export function AddIncomeModal({
  isOpen,
  onClose,
  onSuccess,
  incomeToEdit = null,
  recurringSchedules = [],
}: AddIncomeModalProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [apiError, setApiError] = useState<string | null>(null);
  const [matchingSchedule, setMatchingSchedule] =
    useState<RecurringSchedule | null>(null);
  const [pendingPayload, setPendingPayload] = useState<CreateIncomeData | null>(
    null,
  );
  const [isLinkingRecurring, setIsLinkingRecurring] = useState(false);
  const isEditing = incomeToEdit !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: formatDateForInput(new Date()),
      isFixed: false,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (incomeToEdit) {
      reset({
        description: incomeToEdit.description,
        amount: incomeToEdit.amount.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        date: toDateInputValue(incomeToEdit.date),
        isFixed: incomeToEdit.isFixed,
      });
      return;
    }

    reset({
      description: "",
      amount: "",
      date: formatDateForInput(new Date()),
      isFixed: false,
    });
  }, [incomeToEdit, isOpen, reset]);

  const descriptionValue = watch("description");
  const amountValue = watch("amount");
  const dateValue = watch("date");

  useEffect(() => {
    if (!matchingSchedule || !pendingPayload) {
      return;
    }

    const currentAmount = parseFloat(amountValue.replace(/\./g, "").replace(",", "."));
    const formChanged =
      descriptionValue !== pendingPayload.description ||
      dateValue !== pendingPayload.date ||
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
  ]);

  async function onSubmit(data: IncomeFormValues) {
    setApiError(null);
    try {
      const payload: CreateIncomeData = {
        ...data,
        amount: parseFloat(data.amount.replace(/\./g, "").replace(",", ".")),
      };

      if (incomeToEdit) {
        await updateIncome(incomeToEdit.id, payload);
      } else {
        const match = findMatchingRecurringSchedule({
          schedules: recurringSchedules,
          type: "Income",
          description: payload.description,
          amount: payload.amount,
          date: payload.date,
        });

        if (match) {
          setMatchingSchedule(match);
          setPendingPayload(payload);
          return;
        }

        await saveNewIncome(payload);
      }
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Falha ao adicionar receita:", error);
      setApiError("Não foi possível salvar a receita. Tente novamente.");
    }
  }

  const saveNewIncome = async (payload: CreateIncomeData) => {
    await addIncome(payload);
  };

  const handleRecurringLinkChoice = async (shouldLink: boolean) => {
    if (!pendingPayload) {
      return;
    }

    setIsLinkingRecurring(true);
    setApiError(null);
    try {
      await saveNewIncome({
        ...pendingPayload,
        recurringScheduleId: shouldLink ? matchingSchedule?.id : null,
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Falha ao vincular receita recorrente:", error);
      setApiError("Não foi possível salvar a receita. Tente novamente.");
    } finally {
      setIsLinkingRecurring(false);
    }
  };

  const handleClose = () => {
    reset({
      description: "",
      amount: "",
      date: formatDateForInput(new Date()),
      isFixed: false,
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
                  {isEditing ? "Editar receita" : "Nova receita"}
                </h2>
                <p className="mt-0.5 text-ui text-foreground-muted">{isEditing ? "Ajuste os dados da receita." : "Salário, freela ou qualquer dinheiro que entrou."}</p>
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
                    htmlFor="amountIncome"
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
                    id="amountIncome"
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2 text-2xl font-medium tabular-nums text-foreground outline-none transition-colors focus:border-success focus:ring-2 focus:ring-success/25 placeholder:text-foreground-subtle"
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
                    htmlFor="dateIncome"
                    className="mb-1.5 block text-ui text-foreground-muted"
                  >
                    Data <span className="text-danger" aria-hidden>*</span>
                  </label>
                  <input
                    {...register("date")}
                    id="dateIncome"
                    type="date"
                    className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-success/40 focus:border-success"
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
                  htmlFor="descriptionIncome"
                  className="mb-1.5 block text-ui text-foreground-muted"
                >
                  Descrição <span className="text-danger" aria-hidden>*</span>
                </label>
                <input
                  {...register("description")}
                  id="descriptionIncome"
                  type="text"
                  className="w-full rounded-[var(--radius-control)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-success focus:ring-2 focus:ring-success/25 placeholder:text-foreground-subtle"
                  placeholder="Ex.: Salário, Rendimentos, Pix..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-danger font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>


              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isFixed"
                  {...register("isFixed")}
                  className="h-5 w-5 rounded border-border text-success focus:ring-success/40"
                />
                <label
                  htmlFor="isFixed"
                  className="text-sm font-medium text-foreground-muted"
                >
                  Esta é uma renda fixa / recorrente
                </label>
              </div>

              {matchingSchedule && pendingPayload && (
                <div className="rounded-2xl border border-success/24 bg-success/10 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Esta receita parece fazer parte de uma recorrência.
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-success px-6 py-2.5 text-sm font-medium text-[var(--color-on-primary)] transition-colors hover:bg-success/90 disabled:opacity-70"
                >
                  {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Salvar receita"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
