export type PaymentStatus = "completed" | "pending" | "failed";

export interface Payment {
  id: number;
  clientId: number;
  productId: number;
  amount: number;
  status: PaymentStatus;
  date: string;
}