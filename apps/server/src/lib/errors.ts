export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const badRequest = (code: string, msg?: string) => new HttpError(400, code, msg);
export const forbidden = (code = 'forbidden', msg?: string) => new HttpError(403, code, msg);
export const notFound = (code = 'not_found', msg?: string) => new HttpError(404, code, msg);
