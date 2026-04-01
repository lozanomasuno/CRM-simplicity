export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const candidate = payload as Record<string, unknown>;
  const fromMessage = candidate.message;
  if (typeof fromMessage === 'string' && fromMessage.trim()) return fromMessage;
  const fromError = candidate.error;
  if (typeof fromError === 'string' && fromError.trim()) return fromError;
  return null;
}

export function mapApiErrorToMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return error.message || 'Datos invalidos. Revisa el formulario.';
    if (error.status === 404) return 'No se encontro el recurso solicitado.';
    if (error.status >= 500) return 'Error general del servidor. Intenta nuevamente.';
    return error.message || 'No se pudo completar la solicitud.';
  }

  if (error instanceof Error) return error.message;
  return 'Error inesperado de red.';
}

export async function httpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(init?.headers ? init.headers : {}),
  };

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = extractErrorMessage(payload) ?? `HTTP ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return (payload as T) ?? ({} as T);
}
