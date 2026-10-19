import { paymentsRepository } from "./payments.repository";
import { Payment } from "./payments.types";

export const paymentsService = {
  getAll: async (): Promise<Payment[]> => paymentsRepository.findAll(),
  getById: async (id: number): Promise<Payment | null> =>
    (await paymentsRepository.findById(id)) ?? null,
};