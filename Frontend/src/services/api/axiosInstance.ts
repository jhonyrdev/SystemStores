import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Resolve base URL with safe fallbacks
// NOTE: Our service paths already start with "/api" (e.g., api.get("/api/categorias")),
// so the baseURL must NOT include "/api" to avoid double paths like "/api/api/...".
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : `${window.location.origin}`);

// Token storage key (adjust if you use another name)
const TOKEN_KEY = 'auth_token';

// Create instance
const api = axios.create({
  baseURL,
  withCredentials: true, // send cookies (JSESSIONID / etc.)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach Bearer token if available
// NOTE: we only need the type; for ESM avoid runtime destructuring of internal names.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: central error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message);
    }

    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 400:
          console.warn('Solicitud inválida (400)');
          break;
        case 401:
          console.warn('No autorizado (401)');
          // Opcional: redirigir a login o refrescar token
          // window.location.href = '/login';
          break;
        case 403:
          console.warn('Prohibido (403)');
          break;
        case 404:
          console.warn('No encontrado (404)');
          break;
        case 500:
          console.error('Error interno del servidor (500)');
          break;
        default:
          console.error('Error de respuesta', status);
      }
    } else if (error.request) {
      console.error('No hubo respuesta del servidor');
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper methods (tipado básico). Puedes extender con genéricos.
export const http = {
  get: <T = unknown>(url: string, config?: Parameters<typeof api.get>[1]) => api.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]) => api.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]) => api.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.patch>[2]) => api.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: Parameters<typeof api.delete>[1]) => api.delete<T>(url, config),
};

export { baseURL, TOKEN_KEY };
export default api;
