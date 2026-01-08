import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorResponseInterface {
  error: string;
  message?: string;
  stack?: string;
}

export interface HttpError {
  status: number;
  statusText: string;
  message: string;
  error: ErrorResponseInterface;
  originalError: HttpErrorResponse;
  context?: {
    resource?: string;
    operation?: string;
    isSearch?: boolean;
  };
}

export function extractErrorMessage(
  error: HttpErrorResponse | Error | HttpError | unknown,
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (typeof error.error === 'object' && error.error !== null) {
        const errorObj = error.error as { error?: string; message?: string };
        return (
          errorObj.message || errorObj.error || error.message || 'Error al procesar la solicitud'
        );
      }
    }
    return error.message || 'Error al procesar la solicitud';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const errorObj = error as { message: string };
    return errorObj.message;
  }

  return 'Error desconocido';
}
