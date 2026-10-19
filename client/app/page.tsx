"use client";

import { useClients } from "@/context/ClientsContext";
import { usePayments } from "@/context/PaymentContext";
import { useProducts } from "@/context/ProductsContext";

export default function Home() {
  const { products } = useProducts();
  const { clients } = useClients();
  const { payments } = usePayments();

  return (
    <p>
      {products.length} productos, {clients.length} clientes,{" "}
      {payments.length} pagos
    </p>
  );
}