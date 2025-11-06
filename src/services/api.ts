import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { getOrgConfig } from "@/lib/orgConfig";
import { getDeviceId } from "@/lib/deviceId";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_CONSULTATION_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token, x-url-origin y x-device-id a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const { portalName } = getOrgConfig();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (portalName) {
      config.headers["x-url-origin"] = portalName;
    }

    // Agregar device-id dinámico a cada petición
    config.headers["x-device-id"] = getDeviceId();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar el estado de autenticación
      useAuthStore.getState().logout();
      
      // Redirigir al login si estamos en el cliente
      if (typeof window !== 'undefined') {
      //  window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 440) {
      // Código HTTP 440 - Session Timeout
      // Limpiar el estado de autenticación
      useAuthStore.getState().logout();
      
      // Mostrar mensaje de sesión expirada y redirigir al login si estamos en el cliente
      if (typeof window !== 'undefined') {
       // window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
