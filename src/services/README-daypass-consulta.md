# Servicio de Consulta de Pases de Salida

## Descripción

Este servicio proporciona funcionalidades para consultar y filtrar pases de salida con diferentes parámetros. Permite obtener información detallada sobre los pases de salida incluyendo datos del estudiante, solicitante, fechas, estados, autorizadores, etc.

## Endpoint

```
GET /schools/{school_id}/daypasses
```

## Headers Requeridos

```bash
x-device-id: mobile-web-client
x-url-origin: https://admin.celta.interschool.mx
Authorization: Bearer {token}
Content-Type: application/json
```

## Parámetros de Consulta

### Parámetros Obligatorios
- `schoolId` (string): ID de la escuela (default: "1000")

### Parámetros Opcionales
- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10, max: 100)
- `status` (string): Estado del pase de salida
- `date_from` (string): Fecha de inicio (formato: YYYY-MM-DD)
- `date_to` (string): Fecha de fin (formato: YYYY-MM-DD)
- `person_id` (string): ID del estudiante
- `relative_id` (string): ID del solicitante/pariente

## Interfaces

### IDaypassConsulta
```typescript
interface IDaypassConsulta {
  school_id: number;
  guardian_person_id: number;
  student_person_id: number;
  reason: string;
  status: string;
  authorized_at: string | null;
  academic_stage_id: number;
  daypass_date: string;
  daypass_time: string;
  id: number;
  created: string;
  modified: string;
  authorizers: IDaypassAuthorizer[];
  person: IDaypassPerson;
  relative: IDaypassPerson;
}
```

### IDaypassAuthorizer
```typescript
interface IDaypassAuthorizer {
  authorizer_person_id: number;
  authorized: boolean;
  authorized_at: string | null;
  authorization_sequence: number;
  authorized_by: string | null;
  note: string | null;
  daypass_id: number;
  created_at: string;
  authorizer: {
    school_id: number;
    id: number;
    type: string;
    person_internal_id: string;
    given_name: string;
    paternal_name: string;
    maternal_name: string;
    display_name: string | null;
    legal_name: string | null;
    email: string;
  };
}
```

### IDaypassPerson
```typescript
interface IDaypassPerson {
  school_id: number;
  id: number;
  type: string;
  person_internal_id: string;
  given_name: string;
  paternal_name: string;
  maternal_name: string;
  display_name: string | null;
  legal_name: string | null;
  email: string;
}
```

### GetDaypassesConsultaParams
```typescript
interface GetDaypassesConsultaParams {
  schoolId?: string;
  page?: number;
  limit?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  person_id?: string;
  relative_id?: string;
}
```

### DaypassesConsultaResponse
```typescript
interface DaypassesConsultaResponse {
  data: IDaypassConsulta[];
  total: number;
}
```

## Funciones Principales

### getDaypassesConsulta()
Función principal para obtener pases de salida con filtros.

```typescript
const result = await getDaypassesConsulta({
  page: 1,
  limit: 10,
  status: 'pendiente',
  date_from: '2024-01-01',
  date_to: '2024-12-31'
});
```

### formatDateForAPI()
Helper para formatear fechas al formato requerido por la API.

```typescript
const formattedDate = formatDateForAPI(new Date()); // "2024-01-15"
```

### validateConsultaParams()
Valida los parámetros de consulta antes de hacer la petición.

```typescript
const errors = validateConsultaParams({
  date_from: '2024-12-31',
  date_to: '2024-01-01'
});
// errors: ['La fecha de inicio no puede ser mayor a la fecha de fin']
```

## Ejemplos de Uso

### Consulta Básica
```typescript
import { getDaypassesConsulta } from '@/services/daypass-consulta.service';

const daypasses = await getDaypassesConsulta();
```

### Consulta con Filtros
```typescript
const filteredDaypasses = await getDaypassesConsulta({
  page: 1,
  limit: 20,
  status: 'pendiente',
  date_from: '2024-01-01',
  date_to: '2024-01-31'
});
```

### Consulta por Estudiante
```typescript
const studentDaypasses = await getDaypassesConsulta({
  person_id: '12345',
  limit: 50
});
```

## Estructura de Respuesta Real

La API devuelve un array directo de objetos daypass con la siguiente estructura:

```json
[
  {
    "school_id": 1000,
    "guardian_person_id": 8186,
    "student_person_id": 1731,
    "reason": "Pase de Salida con authorizer",
    "status": "PENDIENTE",
    "authorized_at": null,
    "academic_stage_id": 2,
    "daypass_date": "2025-08-25",
    "daypass_time": "06:30:00",
    "id": 1,
    "created": "2025-08-25T00:53:01.693687Z",
    "modified": "2025-08-25T00:53:01.693694Z",
    "authorizers": [
      {
        "authorizer_person_id": 7509,
        "authorized": false,
        "authorized_at": null,
        "authorization_sequence": 1,
        "authorized_by": null,
        "note": null,
        "daypass_id": 1,
        "created_at": "2025-08-26T23:53:20.607080Z",
        "authorizer": {
          "school_id": 1000,
          "id": 7509,
          "type": "USER",
          "person_internal_id": "LILIANV",
          "given_name": "LILIAN MONCERRAT",
          "paternal_name": "VIERA",
          "maternal_name": "MOSQUEDA",
          "display_name": null,
          "legal_name": null,
          "email": "renedsm@gmail.com"
        }
      }
    ],
    "person": {
      "school_id": 1000,
      "id": 1731,
      "type": "STUDENT",
      "person_internal_id": "5210005",
      "given_name": "PAOLA SOFIA",
      "paternal_name": "CANSECO",
      "maternal_name": "HERNANDEZ",
      "display_name": null,
      "legal_name": null,
      "email": "renedsm@gmail.com"
    },
    "relative": {
      "school_id": 1000,
      "id": 8186,
      "type": "RELATIVE",
      "person_internal_id": "F11957",
      "given_name": "PAOLA",
      "paternal_name": "HERNANDEZ",
      "maternal_name": "LANDERO",
      "display_name": null,
      "legal_name": null,
      "email": "renedsm@gmail.com"
    }
  }
]
```

## Manejo de Errores

El servicio incluye manejo completo de errores con mensajes específicos:

- **401**: No tienes permisos para acceder a esta información
- **403**: Acceso denegado
- **404**: No se encontraron pases de salida
- **422**: Parámetros de consulta inválidos
- **500**: Error interno del servidor
- **Network Error**: Error de conexión
- **Timeout**: La solicitud tardó demasiado

## Validaciones

### Fechas
- La fecha de inicio no puede ser mayor a la fecha de fin
- Formato requerido: YYYY-MM-DD

### Paginación
- Página debe ser mayor a 0
- Límite debe estar entre 1 y 100

### Autenticación
- Token de autenticación requerido
- Validación automática del token

## Estados de Pases de Salida

Posibles valores para el parámetro `status`:
- `PENDIENTE`: Pases pendientes de autorización
- `AUTORIZADO`: Pases autorizados
- `RECHAZADO`: Pases rechazados
- `CANCELADO`: Pases cancelados

## Archivo de Servicio

```
src/services/daypass-consulta.service.ts
```

## Dependencias

- `api.ts`: Instancia de axios configurada
- `useAuthStore`: Store de autenticación para obtener el token
