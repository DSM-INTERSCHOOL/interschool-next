# Hooks de Hidratación

## Problema de Hidratación en Next.js

### ¿Qué es la hidratación?
La hidratación es el proceso donde React "rehidrata" el HTML renderizado en el servidor con JavaScript en el cliente. Durante este proceso, el HTML del servidor debe coincidir exactamente con lo que React renderiza en el cliente.

### Problema común
Cuando usamos datos que solo están disponibles en el cliente (como localStorage), el servidor no puede acceder a esta información, causando una diferencia entre el HTML del servidor y el cliente.

### Error típico
```
Hydration failed because the server rendered HTML didn't match the client.
```

## Solución Implementada

### Hook `useHydration`
```typescript
import { useHydration } from '@/hooks/useHydration';

const MyComponent = () => {
  const isHydrated = useHydration();
  
  if (!isHydrated) {
    return <LoadingSpinner />;
  }
  
  // El componente está completamente hidratado
  return <div>Contenido seguro</div>;
};
```

### Hook `useAuthHydration`
```typescript
import { useAuthHydration } from '@/hooks/useHydration';

const ProtectedComponent = () => {
  const { isHydrated, isAuthenticated } = useAuthHydration();
  
  if (!isHydrated) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <ProtectedContent />;
};
```

## Uso en Componentes

### ProtectedRoute
```typescript
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isHydrated, isAuthenticated } = useAuthHydration();

  // Durante la hidratación, mostrar carga
  if (!isHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  // Si no está autenticado, redirigir
  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirigiendo al login..." fullScreen />;
  }

  return <>{children}</>;
};
```

### Página de Login
```typescript
const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const isHydrated = useHydration();

  // Solo redirigir después de la hidratación
  if (isHydrated && isAuthenticated) {
    router.push('/dashboard');
  }

  if (!isHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  return <LoginForm />;
};
```

## Hook `useAuth` Actualizado

El hook `useAuth` ahora maneja la hidratación automáticamente:

```typescript
const { isHydrated, isAuthenticated, token, name } = useAuth();

// Los datos solo están disponibles después de la hidratación
if (!isHydrated) {
  return <LoadingSpinner />;
}

// Ahora es seguro usar los datos
console.log(name); // null durante SSR, valor real después de hidratación
```

## Componente LoadingSpinner

Componente reutilizable para mostrar estados de carga:

```typescript
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Uso básico
<LoadingSpinner />

// Con mensaje personalizado
<LoadingSpinner message="Cargando datos..." />

// Tamaño específico
<LoadingSpinner size="sm" />

// Pantalla completa
<LoadingSpinner fullScreen />
```

## Mejores Prácticas

### ✅ Forma Correcta
```typescript
const MyComponent = () => {
  const isHydrated = useHydration();
  const { isAuthenticated } = useAuth();

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  // Ahora es seguro usar datos del cliente
  return <div>{isAuthenticated ? 'Autenticado' : 'No autenticado'}</div>;
};
```

### ❌ Forma Incorrecta
```typescript
const MyComponent = () => {
  const { isAuthenticated } = useAuth();

  // Esto puede causar errores de hidratación
  return <div>{isAuthenticated ? 'Autenticado' : 'No autenticado'}</div>;
};
```

## Flujo de Hidratación

1. **Servidor**: Renderiza HTML sin datos del cliente
2. **Cliente**: Recibe HTML del servidor
3. **Hidratación**: React "rehidrata" el HTML con JavaScript
4. **Completado**: El componente está listo para usar datos del cliente

## Casos de Uso

- **Autenticación**: Verificar token en localStorage
- **Configuración**: Leer preferencias del usuario
- **Datos dinámicos**: Información que cambia entre servidor y cliente
- **APIs del navegador**: `window`, `localStorage`, `sessionStorage`

## Debugging

Si sigues teniendo problemas de hidratación:

1. **Verificar console**: Buscar errores de hidratación
2. **Usar React DevTools**: Inspeccionar el árbol de componentes
3. **Agregar logs**: `console.log('isHydrated:', isHydrated)`
4. **Verificar datos**: Asegurar que los datos sean consistentes

# Hook usePermisos

## Descripción

El hook `usePermisos` maneja la carga y gestión de permisos de usuario desde la API legacy. Se ejecuta automáticamente al cargar la página si no hay permisos en el store.

## Funcionalidad

### Carga Automática
- ✅ **Carga única**: Se ejecuta solo una vez al montar el componente
- ✅ **Verificación**: Solo carga si no hay permisos en el store
- ✅ **Prevención de duplicados**: Evita múltiples llamadas simultáneas

### Estados
- **`isLoading`**: Indica si se está cargando los permisos
- **`error`**: Mensaje de error si falla la carga
- **`permisos`**: Array de permisos del usuario

### Funciones
- **`loadPermisos()`**: Carga los permisos desde la API
- **`refreshPermisos()`**: Recarga los permisos (útil para actualizar)

## API Endpoint

```bash
POST http://core-api.idsm.xyz:8090/web-login
```

### Headers
```json
{
  "x-device-id": "agent-postman",
  "x-url-origin": "https://admin.celta.interschool.mx",
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "person_id": "DSM",
  "password": "DATA2023+"
}
```

### Respuesta Real
```json
{
  "person_id": 8121,
  "person_internal_id": "DSM",
  "token": "eyJhbGciOiJTUzI1NiIsInR5cCI6IkpXVCJ9...",
  "school_id": 1000,
  "given_name": "DATA",
  "paternal_name": "SOLUTIONS",
  "maternal_name": "MEXICO",
  "email": "soluciones@interschool.mx",
  "status": "ACTIVO",
  "last_login": "2023-10-01T00:00:00Z",
  "time_zone": "America/Mexico_City",
  "person_type": "USER",
  "meta_data": {
    "duration": 3600,
    "sessionNumber": 1,
    "idUsuario": 8121,
    "nombreEscuela": "CELTA",
    "originalSessionId": "session123",
    "sessionIdEncripted": "encrypted123",
    "nombreUsuario": "DATA SOLUTIONS MEXICO",
    "permisos": [
      {
        "IdPermiso": 164,
        "NombreModulo": "REPORTES",
        "GrupoMenu": "Inscritos",
        "Etiqueta": "Reporte Alumnos Directorio",
        "Accion": "showImpresionAlumnosDirectorio",
        "Namespace": "inscritos",
        "Contexto": "ISReportes",
        "Discriminator": "Menu",
        "OrdenMenu": 3,
        "TipoPermiso": "Libre",
        "Legacy": 1,
        "Clase": "",
        "IdGrupoMenu": 66,
        "Target": "frame_contenido",
        "TipoAccesso": "Libre",
        "Descripcion": "Reporte Alumnos Directorio"
      }
    ]
  }
}
```

## Validación de Respuesta

La función verifica:
- `response.data.meta_data.permisos` existe y es un array
- Si no cumple, lanza error "Respuesta inválida del servidor"

## Estructura de Permisos

```typescript
interface Permiso {
  IdPermiso: number;
  NombreModulo: string;
  GrupoMenu: string;
  Etiqueta: string;
  Accion: string;
  Namespace: string;
  Contexto: string;
  Discriminator: string;
  OrdenMenu?: number;
  TipoPermiso?: string;
  Legacy?: number;
  Clase?: string;
  IdGrupoMenu?: number;
  Target?: string;
  TipoAccesso?: string;
  Descripcion?: string;
}
```

## Uso en Componentes

```typescript
import { usePermisos } from '@/hooks/usePermisos';

const MyComponent = () => {
  const { permisos, isLoading, error, refreshPermisos } = usePermisos();

  if (isLoading) {
    return <div>Cargando permisos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {permisos.map(permiso => (
        <div key={permiso.IdPermiso}>{permiso.Etiqueta}</div>
      ))}
    </div>
  );
};
```

## Integración con Sidebar

El Sidebar usa este hook para:
1. **Cargar permisos** automáticamente al montar
2. **Mostrar loading** mientras carga
3. **Mostrar error** si falla
4. **Construir menú** dinámicamente con `buildSidebarMenuFromPermisos`

## Persistencia

Los permisos se almacenan en:
- **Zustand Store**: Estado global de la aplicación
- **localStorage**: Persistencia entre sesiones
- **Key**: `auth-storage`

## Manejo de Errores

- **401**: No autorizado
- **500+**: Error del servidor
- **Network**: Error de conexión
- **Timeout**: Solicitud tardó demasiado
- **Otros**: Mensaje genérico

## Logs

El hook registra en consola:
- `Cargando permisos desde la API...`
- `Permisos cargados: [array]`
- `Error al cargar permisos: [error]`