// Mismas reglas que valida el servidor: el formulario avisa antes de enviar,
// pero el servidor sigue siendo el que decide

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

export const validatePassword = (
  value: string,
  checkLength: boolean
): string | undefined => {
  if (!value) return "Escribe tu contraseña";
  // En el login no se revisa el largo: la contraseña ya existe
  if (checkLength && value.length < MIN_PASSWORD_LENGTH)
    return `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
};
