"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { Product } from "@/types/products";

interface ProductsContextValue {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  fetchProductById: (id: number) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(
  undefined
);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() =>{
  let cancelled = false;

 api
  .get<Product[]>("/products")
  .then(({ data }) => {
    if (!cancelled) setProducts(data);
    })
  .catch(() => {
    if (!cancelled)
      setError("No se pudieron cargar los productos");
    })
  .finally(() => {
    if (!cancelled) {
      setLoading(false);
    }
  });
return () => {
  cancelled = true;
};
}, []);

  const fetchProductById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Product>(`/products/${id}`);
      setSelectedProduct(data);
    } catch {
      setError("No se pudo cargar el producto");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProductsContext.Provider
      value={{ products, selectedProduct, loading, error, fetchProductById }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts debe usarse dentro de ProductsProvider");
  }
  return context;
}