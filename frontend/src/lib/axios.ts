import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface ApiErrorResponse {
  message?: string | string[];
}

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// ─── Single source of truth for the API base URL ──────────────────────────────
// Production API: https://gippo-back.onrender.com/api/v1
// Swagger docs:   https://gippo-back.onrender.com/api/v1/docs (docs only)
// ──────────────────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://gippo-back.onrender.com/api/v1';

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
    // Sanitize & normalize request URL
    if (config.url) {
      let raw = config.url.trim();
      // Remove duplicated /api/v1 if present in relative URL
      if (raw.startsWith('/api/v1/')) {
        raw = raw.slice(7);
      } else if (raw.startsWith('api/v1/')) {
        raw = raw.slice(6);
      }
      // Ensure leading slash
      config.url = raw.startsWith('/') ? raw : `/${raw}`;
    }

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
      const base = (config.baseURL ?? '').replace(/\/+$/, '');
      const path = config.url ?? '';
      console.log('[API REQUEST]', {
        method: (config.method ?? 'GET').toUpperCase(),
        baseURL: config.baseURL,
        url: config.url,
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

  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // Keep request failures visible in development without causing Next.js to
    // surface them as a red "Console Error" overlay. The failure is still
    // propagated below, so React Query/forms can show it to the user.
    if (process.env.NODE_ENV !== 'production') {
      const base = (error.config?.baseURL ?? '').replace(/\/$/, '');
      const rawPath = error.config?.url ?? '';
      const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      const requestUrl = error.config ? `${base}${path}` : 'unknown URL';
      const status = error.response?.status ?? 'network error';
      const response = error.response?.data;
      const detail =
        typeof response === 'string'
          ? response
          : response?.message ?? error.message;

      console.warn(
        `[API] ${(error.config?.method ?? 'REQUEST').toUpperCase()} ${requestUrl} failed (${status}): ${detail}`,
      );
    }

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
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gippo_access_token');
          localStorage.removeItem('gippo_refresh_token');
          localStorage.removeItem('gippo_user');
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }
    }

    // ── Extract human-readable message from backend ───────────────────────
    const rawMessage = error.response?.data?.message;
    let message = Array.isArray(rawMessage)
      ? rawMessage.join('; ')
      : typeof rawMessage === 'string' && rawMessage.trim()
        ? rawMessage
        : error.message || 'Serverda xatolik yuz berdi';

    // ── Translate Database / Prisma unique constraint errors ───────────────
    if (
      (message.includes('Unique constraint failed') && message.includes('phone')) ||
      (message.toLowerCase().includes('phone') && (message.includes('unique') || message.includes('Unique') || message.includes('P2002')))
    ) {
      message = "Bu telefon raqami allaqachon ro'yxatdan o'tgan. Boshqa raqam kiriting yoki tizimga kiring.";
    } else if (
      (message.includes('Unique constraint failed') && message.includes('email')) ||
      message.includes('email already exists') ||
      message.includes('Email already registered') ||
      message.includes('User with this email already exists')
    ) {
      message = "Ushbu email manzili allaqachon ro'yxatdan o'tgan. Boshqa email kiriting yoki tizimga kiring.";
    } else if (
      (message.includes('Unique constraint failed') && message.includes('licenseNumber')) ||
      message.includes('license number already exists') ||
      message.includes('Doctor profile with this license number already exists')
    ) {
      message = "Ushbu litsenziya raqami allaqachon ro'yxatdan o'tgan. Boshqa litsenziya raqamini kiriting.";
    } else if (message.includes('Invalid') && message.includes('invocation')) {
      message = "Ma'lumotlar bazasida moslik xatosi yuz berdi. Iltimos, kiritilgan ma'lumotlarni tekshiring.";
    }

    error.message = message;
    return Promise.reject(error);
  },
);
