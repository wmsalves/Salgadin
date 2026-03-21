import { useEffect, useState, useCallback } from "react";
import {
  getCategories,
  deleteCategory,
  type Category,
} from "../services/categoryService";
import { Plus, Trash2, Edit } from "lucide-react";

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
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-sm text-foreground-muted">
            Organize seus tipos de despesas.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all active:scale-95">
          <Plus size={16} />
          <span className="hidden sm:inline">Nova Categoria</span>
        </button>
      </header>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <ul className="divide-y divide-border">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <li
                key={cat.id}
                className="py-4 flex items-center justify-between hover:bg-surface-2 transition-colors rounded-lg px-2"
              >
                <span className="font-semibold text-foreground">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-foreground-subtle hover:text-primary hover:bg-surface-2 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-foreground-subtle hover:text-danger hover:bg-surface-2 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-foreground-subtle py-12 font-medium">
              Voce ainda nao tem nenhuma categoria personalizada.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
