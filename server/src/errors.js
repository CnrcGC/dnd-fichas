export class AppError extends Error {
  constructor(code, message, statusCode = 500, details) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorBody(error, requestId) {
  return {
    code: error.code ?? (error.validation ? "validation-error" : "internal-error"),
    message: error.statusCode >= 500 || !error.statusCode ? "Não foi possível concluir a operação." : error.message,
    ...(error.statusCode < 500 && error.details ? { details: error.details } : {}),
    requestId,
  };
}

