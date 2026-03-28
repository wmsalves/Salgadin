import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { updateCategory, type Category } from "../services/categoryService";
import { AxiosError } from "axios";

const editCategorySchema = z.object({
  name: z.string().min(2, "A categoria deve ter no mínimo 2 caracteres."),
});

type EditCategoryValues = z.infer<typeof editCategorySchema>;

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: Category | null;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: EditCategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditCategoryValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({ name: initialData.name });
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const onSubmit = async (data: EditCategoryValues) => {
    if (!initialData) return;
    
    try {
      if (data.name.trim() === initialData.name) {
        onClose();
        return;
      }
      
      await updateCategory(initialData.id, { name: data.name.trim() });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setError("root", { message: error.response.data.message });
      } else {
        setError("root", {
          message: "Não foi possível atualizar a categoria.",
        });
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-surface-2/50 px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">
                Editar Categoria
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-foreground-muted hover:bg-surface-3 hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <Input
                  label="Nome da categoria"
                  placeholder="Ex: Alimentação"
                  icon={<Tag />}
                  error={errors.name}
                  {...register("name")}
                  autoFocus
                />
              </div>

              {errors.root && (
                <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {errors.root.message}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-foreground-muted hover:bg-surface-2 transition-colors"
                >
                  Cancelar
                </button>
                <Button type="submit" isLoading={isSubmitting}>
                  Salvar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
