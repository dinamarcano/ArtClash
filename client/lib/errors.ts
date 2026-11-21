import { isAxiosError } from "axios";

// Saca un mensaje legible de un error de Axios para mostrarlo en un toast
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    // El servidor respondió con { message }
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    // No hubo respuesta: servidor caído o sin internet
    if (!error.response) return "No hay conexión con el servidor";
  }
  return fallback;
};
