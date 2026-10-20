"use client";

import { useClients } from "@/context/UsersContext";
import { usePayments } from "@/context/VotesContext";
import { useProducts } from "@/context/MascotsContext";

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