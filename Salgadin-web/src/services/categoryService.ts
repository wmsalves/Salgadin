import { api } from "./api";

export interface Category {
  id: number;
  name: string;
}

export interface CategoryData {
  name: string;
}

export interface CategorySummary {
  id: number;
  name: string;
  spent: number;
  limit: number;
}

export const getCategorySummary = async (year: number, month: number): Promise<CategorySummary[]> => {
  const response = await api.get("/category/summary", { params: { year, month } });
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/category");
  return response.data;
};

export const createCategory = async (data: CategoryData): Promise<Category> => {
  const response = await api.post("/category", data);
  return response.data;
};

export const updateCategory = async (
  id: number,
  data: CategoryData
): Promise<Category> => {
  const response = await api.put(`/category/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/category/${id}`);
};
