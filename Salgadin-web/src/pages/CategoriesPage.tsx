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
      setError("Não foi possível carregar suas categorias.");
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        await deleteCategory(id);
        fetchData();
      } catch (err) {
        const message =
          (err as any).response?.data?.message ||
          "Falha ao excluir a categoria.";
        alert(message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Carregando categorias...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="p-8 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 max-w-md">
          <p className="text-red-700 dark:text-red-400 font-medium text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 overflow-y-scroll">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-emerald-500 bg-clip-text text-transparent">
            Minhas Categorias
          </h1>
          <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all active:scale-95">
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Categoria</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <ul className="divide-y divide-slate-200">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li
                  key={cat.id}
                  className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg px-2"
                >
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-12 font-medium">
                Você ainda não tem nenhuma categoria personalizada.
              </p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
