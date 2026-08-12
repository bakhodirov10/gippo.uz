import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Single source of truth for the API base URL ──────────────────────────────
// Set NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 in .env.local
// Frontend:  http://localhost:3001  (Next.js)
// Backend:   http://localhost:3000  (NestJS)
// API prefix: /api/v1
// ──────────────────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let hasAccessToken = false;
    // Attach JWT access token if present
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gippo_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        hasAccessToken = true;
      }
    }

    // Dev-only: log the full final request URL so URL bugs are immediately visible
    if (process.env.NODE_ENV !== 'production') {
      const base = (config.baseURL ?? '').replace(/\/$/, '');
      const path = config.url ?? '';
      console.log('[API REQUEST]', {
        method: (config.method ?? 'GET').toUpperCase(),
        baseURL: config.baseURL,
        url: path,
        finalURL: `${base}${path}`,
        hasAccessToken,
      });
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps every success in { success: true, data: T, message, code }
    // Unwrap so callers receive T directly.
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data
    ) {
      return response.data.data; // ← unwrap to T
    }
    return response.data;
  },

  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any;

    // ── Token rotation on 401 ─────────────────────────────────────────────
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('gippo_refresh_token')
            : null;

        if (refreshToken) {
          // Use raw axios to avoid interceptor loop
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          // /auth/refresh returns flat { accessToken, refreshToken }
          const newAccess =
            res.data?.data?.accessToken ?? res.data?.accessToken;
          const newRefresh =
            res.data?.data?.refreshToken ?? res.data?.refreshToken;

          if (newAccess) {
            localStorage.setItem('gippo_access_token', newAccess);
            if (newRefresh) {
              localStorage.setItem('gippo_refresh_token', newRefresh);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return apiClient(originalRequest);
          }
        }
      } catch (_refreshErr) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gippo_access_token');
          localStorage.removeItem('gippo_refresh_token');
          localStorage.removeItem('gippo_user');
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }
    }

    // ── Structured dev error logging ──────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
      const base = (error.config?.baseURL ?? '').replace(/\/$/, '');
      const path = error.config?.url ?? '';
      console.error('[API ERROR]', {
        name: error.name,
        message: error.message,
        method: (error.config?.method ?? '').toUpperCase(),
        baseURL: error.config?.baseURL,
        url: path,
        finalURL: `${base}${path}`,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data ?? '(no response — network error?)',
        isAxiosError: error.isAxiosError,
      });
    }

    // ── Extract human-readable message from backend ───────────────────────
    const rawMessage = error.response?.data?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join('; ')
      : typeof rawMessage === 'string' && rawMessage.trim()
        ? rawMessage
        : error.message || 'Serverda xatolik yuz berdi';

    error.message = message;
    return Promise.reject(error);
  },
);
