import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { DeleteCategoryModal } from "../components/DeleteCategoryModal";
import { ConfirmActionModal } from "../components/ConfirmActionModal";
import {
  getCategorySummary,
  deleteCategory,
  createCategory,
  type CategorySummary,
} from "../services/categoryService";
import { EditCategoryModal } from "../components/EditCategoryModal";
import {
  Plus,
  Trash2,
  Edit,
  Utensils,
  Bus,
  ShoppingCart,
  HeartPulse,
  GraduationCap,
  Home,
  Sparkles,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import {
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
} from "../services/subcategoryService";
import type { Subcategory } from "../lib/types";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  alimentacao: Utensils,
  transporte: Bus,
  compras: ShoppingCart,
  saude: HeartPulse,
  educacao: GraduationCap,
  moradia: Home,
  lazer: Sparkles,
  outros: MoreHorizontal,
};

const normalizeKey = (value: string) =>
  value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getErrorMessage = (error: unknown, fallback: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (error as any)?.response?.data;
  if (!data) return fallback;
  if (typeof data?.message === "string") return data.message;
  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat();
    if (messages.length > 0) return messages.join(" ");
  }
  return fallback;
};

export default function CategoriesPage() {
  const categoryInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null
  );
  const [subcategoryMap, setSubcategoryMap] = useState<
    Record<number, Subcategory[]>
  >({});
  const [subcategoryLoading, setSubcategoryLoading] = useState<
    Record<number, boolean>
  >({});
  const [newSubcategoryName, setNewSubcategoryName] = useState<
    Record<number, string>
  >({});
  const [subcategoryCreateError, setSubcategoryCreateError] = useState<
    Record<number, string | null>
  >({});
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [deleteCategoryError, setDeleteCategoryError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<{ id: number; name: string } | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<{
    categoryId: number;
    subcategoryId: number;
    name: string;
  } | null>(null);
  const [isDeletingSubcategory, setIsDeletingSubcategory] = useState(false);
  const [deleteSubcategoryError, setDeleteSubcategoryError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const now = new Date();
      const data = await getCategorySummary(now.getFullYear(), now.getMonth() + 1);
      setCategories(data);
    } catch (err) {
      console.error("Falha ao buscar categorias:", err);
      setError("Nao foi possivel carregar suas categorias.");
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleOpenDeleteModal = (id: number, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteCategoryError(null);
    setIsDeleteModalOpen(true);
  };

  const handleOpenEditModal = (id: number, name: string) => {
    setCategoryToEdit({ id, name });
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    setDeleteCategoryError(null);
    try {
      await deleteCategory(categoryToDelete.id);
      fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      setDeleteCategoryError(
        getErrorMessage(error, "Não foi possível excluir a categoria.")
      );
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCreateError("Digite um nome para criar a categoria.");
      categoryInputRef.current?.focus();
      return;
    }

    if (name.length < 3) {
      setCreateError("O nome da categoria deve ter pelo menos 3 caracteres.");
      categoryInputRef.current?.focus();
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      await createCategory({ name });
      setNewCategoryName("");
      await fetchData();
    } catch (error) {
      setCreateError(getErrorMessage(error, "Falha ao criar a categoria."));
    } finally {
      setIsCreating(false);
    }
  };

  const toggleSubcategories = async (categoryId: number) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
    if (subcategoryMap[categoryId] || subcategoryLoading[categoryId]) {
      return;
    }
    setSubcategoryLoading((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const data = await getSubcategories(categoryId);
      setSubcategoryMap((prev) => ({ ...prev, [categoryId]: data }));
    } catch (err) {
      console.error("Falha ao buscar subcategorias:", err);
    } finally {
      setSubcategoryLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleAddSubcategory = async (categoryId: number) => {
    const name = (newSubcategoryName[categoryId] || "").trim();
    if (!name) return;
    setSubcategoryCreateError((prev) => ({ ...prev, [categoryId]: null }));
    try {
      const created = await createSubcategory(categoryId, name);
      setSubcategoryMap((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), created],
      }));
      setNewSubcategoryName((prev) => ({ ...prev, [categoryId]: "" }));
    } catch (err) {
      console.error("Falha ao criar subcategoria:", err);
      setSubcategoryCreateError((prev) => ({
        ...prev,
        [categoryId]: getErrorMessage(
          err,
          "Nao foi possivel criar a subcategoria.",
        ),
      }));
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!subcategoryToDelete) return;
    setIsDeletingSubcategory(true);
    setDeleteSubcategoryError(null);
    try {
      await deleteSubcategory(
        subcategoryToDelete.categoryId,
        subcategoryToDelete.subcategoryId,
      );
      setSubcategoryMap((prev) => ({
        ...prev,
        [subcategoryToDelete.categoryId]: (prev[subcategoryToDelete.categoryId] || []).filter(
          (item) => item.id !== subcategoryToDelete.subcategoryId
        ),
      }));
      setSubcategoryToDelete(null);
    } catch (err) {
      console.error("Falha ao excluir subcategoria:", err);
      setDeleteSubcategoryError(
        getErrorMessage(err, "Nao foi possivel excluir a subcategoria."),
      );
    } finally {
      setIsDeletingSubcategory(false);
    }
  };

  const categoryCards = useMemo(() => {
    if (categories.length === 0) return [];
    return categories.map((cat) => {
      const percent = cat.limit > 0 ? Math.min(Math.round((cat.spent / cat.limit) * 100), 100) : 0;
      return {
        ...cat,
        percent,
      };
    });
  }, [categories]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="h-10 w-10 text-primary animate-spin">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-foreground-muted font-medium">
            Carregando categorias...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="p-8 rounded-xl bg-surface-2 border border-danger/30 max-w-md">
          <p className="text-danger font-medium text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categorias</h1>
          <p className="text-sm text-foreground-muted">
            Monitore seus gastos por categoria e ajuste seus limites.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            ref={categoryInputRef}
            value={newCategoryName}
            onChange={(event) => {
              setNewCategoryName(event.target.value);
              if (createError) {
                setCreateError(null);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCreateCategory();
              }
            }}
            placeholder="Nova categoria"
            aria-invalid={createError ? "true" : "false"}
            className={clsx(
              "flex-1 rounded-xl border bg-surface/70 px-4 py-2 text-sm text-foreground outline-none focus:border-primary/50",
              createError ? "border-danger/60" : "border-border",
            )}
          />
          <button
            type="button"
            onClick={handleCreateCategory}
            disabled={isCreating}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition disabled:opacity-60"
          >
            <Plus size={16} />
            {isCreating ? "Salvando..." : "Criar categoria"}
          </button>
        </div>
        {createError && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {createError}
          </div>
        )}
      </header>

      {categoryCards.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/70 p-8 text-center text-foreground-subtle">
          Voce ainda nao tem nenhuma categoria personalizada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {categoryCards.map((cat, index) => {
            const Icon = iconMap[normalizeKey(cat.name)] || LayoutFallback;
            const isHigh = cat.percent >= 80;
            return (
              <div
                key={cat.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] soft-hover animate-fade-in opacity-0 [animation-fill-mode:forwards]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-surface-2 border border-border text-primary grid place-items-center">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-foreground-subtle">
                        Limite mensal definido
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(cat.id, cat.name)}
                      className="h-9 w-9 rounded-full border border-border bg-surface-2 text-foreground hover:text-primary hover:border-primary/40 hover:bg-surface-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 grid place-items-center leading-none"
                      title="Editar"
                      aria-label={`Editar ${cat.name}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(cat.id, cat.name)}
                      className="h-9 w-9 rounded-full border border-border bg-surface-2 text-danger hover:border-danger/40 hover:bg-danger/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 grid place-items-center leading-none"
                      title="Excluir"
                      aria-label={`Excluir ${cat.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-foreground-subtle">Gasto atual</span>
                  <span
                    className={clsx(
                      "font-semibold",
                      isHigh ? "text-danger" : "text-primary"
                    )}
                  >
                    R$ {cat.spent.toFixed(2)}
                  </span>
                </div>

                {cat.limit > 0 ? (
                  <>
                    <div className="mt-2 h-2 rounded-full bg-surface-3">
                      <div
                        className={clsx(
                          "h-2 rounded-full",
                          isHigh ? "bg-danger" : "bg-primary"
                        )}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-foreground-subtle">
                      <span>{cat.percent}% do limite</span>
                      <span>Limite: R$ {cat.limit.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 flex items-center justify-between text-xs text-foreground-muted">
                    <span>Nenhum limite de gastos definido.</span>
                  </div>
                )}

                <div className="mt-4 border-t border-border/60 pt-4">
                  <button
                    onClick={() => toggleSubcategories(cat.id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-foreground-muted hover:text-foreground transition"
                  >
                    <span>Subcategorias</span>
                    {expandedCategoryId === cat.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {expandedCategoryId === cat.id && (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-2">
                        <input
                          value={newSubcategoryName[cat.id] || ""}
                          onChange={(event) =>
                            setNewSubcategoryName((prev) => ({
                              ...prev,
                              [cat.id]: event.target.value,
                            }))
                          }
                          placeholder="Nova subcategoria"
                          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
                        />
                        <button
                          onClick={() => handleAddSubcategory(cat.id)}
                          className="rounded-lg border border-border bg-surface-2 px-3 text-xs font-semibold text-foreground hover:bg-surface-3 transition"
                        >
                          Adicionar
                        </button>
                      </div>
                      {subcategoryCreateError[cat.id] && (
                        <p className="text-xs text-danger">
                          {subcategoryCreateError[cat.id]}
                        </p>
                      )}

                      {subcategoryLoading[cat.id] ? (
                        <p className="text-xs text-foreground-subtle">
                          Carregando subcategorias...
                        </p>
                      ) : (subcategoryMap[cat.id] || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(subcategoryMap[cat.id] || []).map((sub) => (
                            <div
                              key={sub.id}
                              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-foreground soft-hover-sm hover:bg-surface-3"
                            >
                              {sub.name}
                              <button
                                onClick={() => {
                                  setDeleteSubcategoryError(null);
                                  setSubcategoryToDelete({
                                    categoryId: cat.id,
                                    subcategoryId: sub.id,
                                    name: sub.name,
                                  });
                                }}
                                className="text-danger hover:text-danger-strong"
                                aria-label={`Excluir ${sub.name}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-foreground-subtle">
                          Nenhuma subcategoria cadastrada.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        categoryName={categoryToDelete?.name || ""}
        isDeleting={isDeletingCategory}
        errorStr={deleteCategoryError}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        initialData={categoryToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchData}
      />

      <ConfirmActionModal
        isOpen={subcategoryToDelete !== null}
        title="Excluir subcategoria"
        description={`Voce esta prestes a excluir permanentemente a subcategoria "${subcategoryToDelete?.name ?? ""}". Esta acao nao podera ser desfeita.`}
        confirmLabel="Sim, excluir"
        onClose={() => {
          if (isDeletingSubcategory) return;
          setDeleteSubcategoryError(null);
          setSubcategoryToDelete(null);
        }}
        onConfirm={handleDeleteSubcategory}
        isConfirming={isDeletingSubcategory}
        errorMessage={deleteSubcategoryError}
      />
    </div>
  );
}

function LayoutFallback() {
  return <div className="h-4 w-4 rounded-sm bg-primary/60" />;
}
