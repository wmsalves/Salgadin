import { api } from "./api";
import type { Subcategory } from "../lib/types";

export const getSubcategories = async (
  categoryId: number
): Promise<Subcategory[]> => {
  const response = await api.get(`/categories/${categoryId}/subcategories`);
  return response.data;
};

export const createSubcategory = async (
  categoryId: number,
  name: string
): Promise<Subcategory> => {
  const response = await api.post(`/categories/${categoryId}/subcategories`, {
    name,
  });
  return response.data;
};

export const updateSubcategory = async (
  categoryId: number,
  subcategoryId: number,
  name: string
): Promise<Subcategory> => {
  const response = await api.put(
    `/categories/${categoryId}/subcategories/${subcategoryId}`,
    { name }
  );
  return response.data;
};

export const deleteSubcategory = async (
  categoryId: number,
  subcategoryId: number
): Promise<void> => {
  await api.delete(`/categories/${categoryId}/subcategories/${subcategoryId}`);
};
