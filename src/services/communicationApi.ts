import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { getOrgConfig } from "@/lib/orgConfig";

const communicationApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_COMMUNICATION_URL,
  headers: {
    "Content-Type": "application/json",
    "x-device-id": "mobile-web-client"
  },
});

// Interceptor para agregar el token y x-url-origin a todas las peticiones
communicationApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const { portalName } = getOrgConfig();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (portalName) {
      config.headers["x-url-origin"] = portalName;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
communicationApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar el estado de autenticación
      useAuthStore.getState().logout();

      // Redirigir al login si estamos en el cliente
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 440) {
      // Código HTTP 440 - Session Timeout
      // Limpiar el estado de autenticación
      useAuthStore.getState().logout();

      // Mostrar mensaje de sesión expirada y redirigir al login si estamos en el cliente
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default communicationApi;

