import { productsMock } from "./data.mock";
import { Product } from "./products.types";

export const productsRepository = {
  findAll: async (): Promise<Product[]> => productsMock,
  findById: async (id: number): Promise<Product | undefined> =>
    productsMock.find((product) => product.id === id),
};