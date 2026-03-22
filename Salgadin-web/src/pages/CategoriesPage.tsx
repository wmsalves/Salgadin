import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getCategories,
  deleteCategory,
  type Category,
} from "../services/categoryService";
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
} from "lucide-react";
import clsx from "clsx";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Alimentacao: Utensils,
  "AlimentaÃ§Ã£o": Utensils,
  Transporte: Bus,
  Compras: ShoppingCart,
  Saude: HeartPulse,
  SaÃºde: HeartPulse,
  Educacao: GraduationCap,
  "EducaÃ§Ã£o": GraduationCap,
  Moradia: Home,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getCategories();
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

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta categoria? Esta acao nao pode ser desfeita."
      )
    ) {
      try {
        await deleteCategory(id);
        fetchData();
      } catch (error) {
        const message =
          (error as any).response?.data?.message ||
          "Falha ao excluir a categoria.";
        alert(message);
      }
    }
  };

  const categoryCards = useMemo(() => {
    if (categories.length === 0) return [];
    return categories.map((cat, index) => {
      const baseSpent = 120 + index * 45;
      const limit = 600 + (index % 3) * 200;
      const spent = Math.min(baseSpent, limit);
      const percent = Math.min(Math.round((spent / limit) * 100), 100);
      return {
        ...cat,
        spent,
        limit,
        percent,
      };
    });
  }, [categories]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-surface-3 border-t-primary rounded-full"></div>
            </div>
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
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categorias</h1>
          <p className="text-sm text-foreground-muted">
            Monitore seus gastos por categoria e ajuste seus limites.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition">
          <Plus size={16} />
          Nova categoria
        </button>
      </header>

      {categoryCards.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/70 p-8 text-center text-foreground-subtle">
          Voce ainda nao tem nenhuma categoria personalizada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {categoryCards.map((cat) => {
            const Icon = iconMap[cat.name] || LayoutFallback;
            const isHigh = cat.percent >= 80;
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-border bg-surface/70 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
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
                      className="h-9 w-9 rounded-full border border-border bg-surface-2 text-foreground hover:text-primary hover:border-primary/40 hover:bg-surface-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 grid place-items-center leading-none"
                      title="Editar"
                      aria-label={`Editar ${cat.name}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LayoutFallback() {
  return <div className="h-4 w-4 rounded-sm bg-primary/60" />;
}
