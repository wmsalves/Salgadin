import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { DeleteCategoryModal } from "../components/DeleteCategoryModal";
import { ConfirmActionModal } from "../components/ConfirmActionModal";
import { EmptyState } from "../components/EmptyState";
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
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
} from "../services/subcategoryService";
import type { Subcategory } from "../lib/types";

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-success)",
  "var(--color-primary-strong)",
];

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

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

type CategoryDistributionSlice = CategorySummary & {
  color: string;
  share: number;
};

type CategoryDistributionTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: CategoryDistributionSlice;
  }>;
};

function CategoryDistributionTooltip({
  active,
  payload,
}: CategoryDistributionTooltipProps) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="min-w-[180px] rounded-2xl border border-border/80 bg-[rgba(24,20,18,0.96)] px-3 py-2.5 shadow-[0_18px_38px_rgba(0,0,0,0.34)] backdrop-blur-sm">
      <p className="text-sm font-semibold text-foreground">{item.name}</p>
      <p className="mt-2 text-xs text-foreground-subtle">Gastos no mes</p>
      <p className="text-sm font-semibold text-foreground">
        {formatCurrency(item.spent)}
      </p>
      <p className="mt-1 text-xs text-foreground-muted">
        {item.share.toLocaleString("pt-BR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        })}
        % do total
      </p>
    </div>
  );
}

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

  const categoryDistribution = useMemo<CategoryDistributionSlice[]>(() => {
    const categoriesWithSpend = categoryCards
      .filter((cat) => cat.spent > 0)
      .sort((a, b) => b.spent - a.spent);

    const totalSpent = categoriesWithSpend.reduce(
      (sum, cat) => sum + cat.spent,
      0,
    );

    return categoriesWithSpend.map((cat, index) => ({
      ...cat,
      color: CHART_COLORS[index % CHART_COLORS.length],
      share: totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0,
    }));
  }, [categoryCards]);

  const totalSpent = useMemo(
    () => categoryDistribution.reduce((sum, cat) => sum + cat.spent, 0),
    [categoryDistribution],
  );

  const topSpendingCategory = categoryDistribution[0] ?? null;

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
        <EmptyState
          icon={Sparkles}
          title="Organize seus primeiros pequenos gastos"
          description="Crie categorias como alimentacao, transporte ou mercado para entender para onde o dinheiro vai."
          primaryAction={{
            label: "Criar categoria",
            onClick: () => categoryInputRef.current?.focus(),
          }}
          secondaryAction={{
            label: "Ver dashboard",
            href: "/dashboard",
          }}
        />
      ) : (
        <div className="space-y-6">
          {categoryDistribution.length > 0 && (
            <section className="rounded-3xl border border-border/70 bg-surface/92 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Gastos por categoria
                  </h2>
                  <p className="mt-1 text-sm text-foreground-muted">
                    Veja o peso de cada categoria no total do mes e encontre
                    onde os pequenos gastos mais se concentram.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground-subtle">
                    Total gasto:{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground-subtle">
                    Categorias ativas:{" "}
                    <span className="font-semibold text-foreground">
                      {categoryDistribution.length}
                    </span>
                  </div>
                  {topSpendingCategory && (
                    <div className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground-subtle">
                      Maior categoria:{" "}
                      <span className="font-semibold text-foreground">
                        {topSpendingCategory.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] xl:items-start">
                <div className="salgadin-chart h-[280px] rounded-3xl border border-border/60 bg-surface/55 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart accessibilityLayer={false} tabIndex={-1}>
                      <Pie
                        data={categoryDistribution}
                        dataKey="spent"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={76}
                        outerRadius={104}
                        paddingAngle={4}
                        stroke="none"
                        rootTabIndex={-1}
                      >
                        {categoryDistribution.map((item) => (
                          <Cell key={item.id} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        cursor={false}
                        isAnimationActive={false}
                        wrapperStyle={{ outline: "none", pointerEvents: "none" }}
                        content={<CategoryDistributionTooltip />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                      Ranking completo
                    </h3>
                    <span className="text-xs text-foreground-subtle">
                      Ordenado por maior gasto
                    </span>
                  </div>

                  <div className="space-y-2">
                    {categoryDistribution.map((cat, index) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-5 text-xs font-semibold text-foreground-muted">
                            {index + 1}
                          </span>
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {cat.name}
                            </p>
                            <p className="text-xs text-foreground-subtle">
                              {cat.share.toLocaleString("pt-BR", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 1,
                              })}
                              % do total
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(cat.spent)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Suas categorias
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Ajuste limites, edite nomes e organize subcategorias sem
                perder de vista o gasto atual.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                        <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-2 text-primary">
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
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-2 leading-none text-foreground transition hover:border-primary/40 hover:bg-surface-3 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          title="Editar"
                          aria-label={`Editar ${cat.name}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(cat.id, cat.name)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-2 leading-none text-danger transition hover:border-danger/40 hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
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
                          isHigh ? "text-danger" : "text-primary",
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
                              isHigh ? "bg-danger" : "bg-primary",
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
                        className="flex w-full items-center justify-between text-xs font-semibold text-foreground-muted transition hover:text-foreground"
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
                              className="rounded-lg border border-border bg-surface-2 px-3 text-xs font-semibold text-foreground transition hover:bg-surface-3"
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
                            <div className="rounded-xl border border-dashed border-border bg-surface/60 px-3 py-2 text-xs leading-5 text-foreground-subtle">
                              Use subcategorias para separar detalhes como cafe,
                              aplicativo, mercado ou lanche.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
