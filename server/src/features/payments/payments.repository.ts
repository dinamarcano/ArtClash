import { paymentsMock } from "./data.mock";
import { Payment } from "./payments.types";

export const paymentsRepository = {
  findAll: async (): Promise<Payment[]> => paymentsMock,
  findById: async (id: number): Promise<Payment | undefined> =>
    paymentsMock.find((payment) => payment.id === id),
};