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
import { Payment } from "@/types/payment";

interface PaymentsContextValue {
  payments: Payment[];
  selectedPayment: Payment | null;
  loading: boolean;
  error: string | null;
  fetchPaymentById: (id: number) => Promise<void>;
}

const PaymentsContext = createContext<PaymentsContextValue | undefined>(
  undefined
);

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() =>{
  let cancelled = false;

 api
  .get<Payment[]>("/payments")
  .then(({ data }) => {
    if (!cancelled) setPayments(data);
    })
  .catch(() => {
    if (!cancelled)
      setError("No se pudieron cargar los pagos");
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

  const fetchPaymentById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Payment>(`/payments/${id}`);
      setSelectedPayment(data);
    } catch {
      setError("No se pudo cargar el pago");
    } finally {
      setLoading(false);
    }
  }, []);


  return (
    <PaymentsContext.Provider
      value={{ payments, selectedPayment, loading, error, fetchPaymentById }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error("usePayments debe usarse dentro de PaymentsProvider");
  }
  return context;
}