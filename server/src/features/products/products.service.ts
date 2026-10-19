import { productsRepository } from "./products.repository";
import { Product } from "./products.types";

export const productsService = {
  getAll: async (): Promise<Product[]> => productsRepository.findAll(),
  getById: async (id: number): Promise<Product | null> =>
    (await productsRepository.findById(id)) ?? null,
};