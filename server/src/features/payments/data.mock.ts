import { Payment } from "./payments.types";

export const paymentsMock: Payment[] = [
  { id: 1, clientId: 1, productId: 1, amount: 25000, status: "completed", date: "2026-10-01" },
  { id: 2, clientId: 2, productId: 3, amount: 15000, status: "pending", date: "2026-10-05" },
  { id: 3, clientId: 3, productId: 2, amount: 40000, status: "failed", date: "2026-10-09" },
];