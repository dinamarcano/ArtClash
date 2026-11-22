import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (!error.response) return "No hay conexión con el servidor";
  }
  return fallback;
};
