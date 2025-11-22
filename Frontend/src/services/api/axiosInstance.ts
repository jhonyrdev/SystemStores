import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : `${window.location.origin}`);

const TOKEN_KEY = "auth_token";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

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
  return Promise.reject(error);
  }
);

// Helper methods (tipado básico). Puedes extender con genéricos.
export const http = {
  get: <T = unknown>(url: string, config?: Parameters<typeof api.get>[1]) =>
    api.get<T>(url, config),
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof api.post>[2]
  ) => api.post<T>(url, data, config),
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof api.put>[2]
  ) => api.put<T>(url, data, config),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof api.patch>[2]
  ) => api.patch<T>(url, data, config),
  delete: <T = unknown>(
    url: string,
    config?: Parameters<typeof api.delete>[1]
  ) => api.delete<T>(url, config),
};

export { baseURL, TOKEN_KEY };
export default api;
