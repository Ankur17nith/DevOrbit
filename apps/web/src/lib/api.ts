export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
    details?: any;
  };
  message?: string;
  requestId?: string;
}

/**
 * Centralized API response parser that inspects Content-Type before parsing.
 * Guarantees that HTML error pages or proxy failures never trigger
 * "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" parsing exceptions.
 */
export async function parseApiResponse<T = any>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get('content-type') || '';
  const requestId = res.headers.get('x-request-id') || undefined;

  // 1. If response is JSON, parse safely
  if (contentType.includes('application/json')) {
    try {
      const json = await res.json();
      return {
        ...json,
        requestId: json.requestId || requestId,
      };
    } catch (parseErr: any) {
      return {
        success: false,
        data: undefined,
        error: {
          message: `Malformed JSON returned from server: ${parseErr.message}`,
          statusCode: res.status,
        },
        message: 'Invalid JSON response',
        requestId,
      };
    }
  }

  // 2. If response is HTML or text, do not crash on res.json()
  const rawText = await res.text();
  let cleanMessage = `Server returned non-JSON response (HTTP ${res.status}).`;

  if (contentType.includes('text/html') || rawText.startsWith('<!DOCTYPE') || rawText.startsWith('<html')) {
    cleanMessage = `API endpoint returned HTML (HTTP ${res.status}). The requested route may be missing, offline, or redirected.`;
  } else if (rawText.trim().length > 0 && rawText.length < 200) {
    cleanMessage = rawText.trim();
  }

  return {
    success: false,
    data: undefined,
    error: {
      message: cleanMessage,
      statusCode: res.status,
      details: rawText.slice(0, 300),
    },
    message: cleanMessage,
    requestId,
  };
}

/**
 * Standard HTTP Fetch Wrapper using the centralized response parser
 */
export async function apiFetch<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  try {
    const res = await fetch(input, {
      ...init,
      headers,
    });
    return await parseApiResponse<T>(res);
  } catch (netErr: any) {
    return {
      success: false,
      data: undefined,
      error: {
        message: netErr.message || 'Network connection failed. Unable to reach DevOrbit API.',
        statusCode: 0,
      },
      message: 'Network error',
    };
  }
}
