# Servicios de la Aplicación

## Autenticación

### auth.service.ts
Servicio principal para manejar la autenticación de usuarios.

**Endpoints:**
- `POST /schools/{school_id}/app-login` - Iniciar sesión

**Estructura de Respuesta:**
```typescript
{
  person_id: number;
  person_internal_id: string;
  token: string;
  school_id: number;
  given_name: string;
  paternal_name: string;
  maternal_name: string;
  email: string;
  display_name: string | null;
  status: string;
  person_type: string;
  person_photo: string | null;
  academic_year: string | null;
  academic_stage_id: number | null;
  last_login: string;
  time_zone: string;
  inoty_notifications_config: any | null;
}
```

**Funciones:**
- `login(credentials, schoolId)` - Autenticación de usuario
- `logout()` - Cerrar sesión (futuro: invalidar token en backend)

### api.ts
Configuración base de axios con interceptores para:
- Agregar automáticamente el token de autenticación a todas las peticiones
- Manejar errores 401 (no autorizado) y redirigir al login

## Pase de Salida

### daypass.service.ts
Servicio para manejar los pases de salida de estudiantes.

**Endpoints:**
- `GET /schools/{school_id}/daypass-authorizers` - Obtener pases pendientes
- `PATCH /schools/{school_id}/daypasses/{daypass_id}/authorizers/{authorizer_person_id}` - Autorizar pase

**Funciones:**
- `getDaypassAuthorizers()` - Obtener pases pendientes de autorización
- `authorizeDaypass()` - Autorizar un pase de salida

## Uso

### Autenticación
```typescript
import { useAuth } from '@/hooks/useAuth';

const { login, logout, isAuthenticated, token, personId, name, email, personInternalId } = useAuth();

// Login
const result = await login('user_id', 'password');
if (result.success) {
  // Redirigir al dashboard
}

// Logout
logout();

// Verificar autenticación
if (isAuthenticated) {
  // Usuario autenticado
}

// Acceder a datos del usuario
console.log(name); // Nombre completo
console.log(personInternalId); // ID interno (ej: "DSM")
console.log(email); // Email del usuario
```

### Pases de Salida
```typescript
import { getDaypassAuthorizers, authorizeDaypass } from '@/services/daypass.service';

// Obtener pases pendientes
const daypasses = await getDaypassAuthorizers();

// Autorizar pase
await authorizeDaypass({
  daypassId: '123',
  dto: { authorized: true, authorized_at: new Date().toISOString() }
});
```

## Configuración

### Variables de Entorno
```env
NEXT_PUBLIC_API_BASE_URL=http://core-api.idsm.xyz:8090
NEXT_PUBLIC_API_CONSULTATION_URL=http://core-api.idsm.xyz:8090
NEXT_PUBLIC_DEFAULT_SCHOOL_ID=1000
```

### Headers Requeridos
- `x-device-id: mobile-web-client` - Para endpoints de autenticación
- `Authorization: Bearer {token}` - Para endpoints protegidos (agregado automáticamente)

## Manejo de Errores

### Errores de Autenticación
- **401**: Credenciales inválidas
- **500+**: Error del servidor
- **Network Error**: Error de conexión

### Errores de API
- **401**: Token inválido o expirado (redirige automáticamente al login)
- **4xx/5xx**: Errores del servidor

## Seguridad

- Tokens se almacenan en localStorage con persistencia
- Interceptores automáticos para manejo de tokens
- Redirección automática en errores 401
- Protección de rutas con middleware y componentes

## Datos del Usuario

El sistema almacena y proporciona acceso a:

- **Datos básicos**: `token`, `personId`, `email`, `name`, `schoolId`
- **Datos adicionales**: `personInternalId`, `status`, `personType`, `personPhoto`, `timeZone`, `lastLogin`
- **Datos legacy**: `permisos` (array vacío por defecto)

## Ejemplo de Respuesta de Login

```json
{
  "person_id": 8121,
  "person_internal_id": "DSM",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "school_id": 1000,
  "given_name": "DATA",
  "paternal_name": "SOLUTIONS",
  "maternal_name": "MEXICO",
  "email": "soluciones@interschool.mx",
  "display_name": null,
  "status": "ACTIVO",
  "person_type": "USER",
  "person_photo": null,
  "academic_year": null,
  "academic_stage_id": null,
  "last_login": "2023-10-01T00:00:00Z",
  "time_zone": "America/Mexico_City",
  "inoty_notifications_config": null
}
```


