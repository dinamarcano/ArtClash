// Error con código HTTP: los services lo lanzan y el manejador de errores
// de app.ts lo convierte en una respuesta JSON con ese status
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}
