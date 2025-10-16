/* eslint-disable @typescript-eslint/no-explicit-any */
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
      } catch (err: any) {
        alert(err.response?.data?.message || "Falha ao excluir a categoria.");
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando categorias...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-600">
            Minhas Categorias
          </h1>
          <button className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition">
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Categoria</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ul className="divide-y divide-slate-200">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li
                  key={cat.id}
                  className="py-3 flex items-center justify-between"
                >
                  <span className="font-medium">{cat.name}</span>
                  <div className="flex items-center gap-4">
                    <button
                      className="text-slate-500 hover:text-blue-600"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-slate-500 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">
                Você ainda não tem nenhuma categoria personalizada.
              </p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
