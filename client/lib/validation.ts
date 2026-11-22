export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export const validateUsername = (value: string): string | undefined => {
  if (!value.trim()) return "Escribe un nombre de usuario";
  if (!USERNAME_REGEX.test(value.trim()))
    return "De 3 a 20 letras, números o guiones bajos (sin espacios)";
};

export const validateEmail = (value: string): string | undefined => {
  if (!value.trim()) return "Escribe tu email";
  if (!EMAIL_REGEX.test(value.trim())) return "Ese email no es válido";
};

export const MAX_MASCOT_NAME_LENGTH = 40;
const MAX_URL_LENGTH = 500;

export const validateMascotName = (value: string): string | undefined => {
  if (!value.trim()) return "Ponle un nombre a tu arte";
  if (value.trim().length > MAX_MASCOT_NAME_LENGTH)
    return `Máximo ${MAX_MASCOT_NAME_LENGTH} caracteres`;
};

export const validateImageUrl = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return "Pega la URL de la imagen";
  if (trimmed.length > MAX_URL_LENGTH) return "La URL es demasiado larga";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:")
      return "La URL debe empezar por http:// o https://";
  } catch {
    return "Esa URL no es válida";
  }
};

export const validatePassword = (
  value: string,
  checkLength: boolean
): string | undefined => {
  if (!value) return "Escribe tu contraseña";
  if (checkLength && value.length < MIN_PASSWORD_LENGTH)
    return `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
};
