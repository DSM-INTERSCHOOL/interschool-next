# Pase de Salida - Aplicación de Autorización

## Descripción

La aplicación de Pase de Salida permite a los usuarios con rol de autorizador visualizar y gestionar las solicitudes de salida de alumnos que requieren su autorización.

## Funcionalidades

### 📋 Visualización de Pases Pendientes
- Lista todos los pases de salida con estado "PENDIENTE"
- Muestra información completa de cada solicitud:
  - **Alumno**: Nombre completo y matrícula
  - **Solicitante**: Nombre completo del pariente
  - **Motivo**: Razón de la salida
  - **Fecha y Hora**: Cuándo se solicita la salida
  - **Estado**: Estado actual del pase
  - **Autorizadores**: Lista de autorizadores con su estado

### ✅ Autorización de Pases
- Botón "Autorizar" para cada pase pendiente
- Confirmación visual durante el proceso de autorización
- Actualización automática de la lista después de autorizar

### 🔄 Gestión de Estados
- Estados visuales claros con iconos y colores
- Badges informativos para cada estado
- Actualización en tiempo real

## Estructura de Archivos

```
daypass/
├── page.tsx                 # Página principal
├── DaypassApp.tsx          # Componente principal de la aplicación
├── components/
│   └── DaypassCard.tsx     # Componente de tarjeta individual
└── README.md              # Esta documentación
```

## Endpoints Utilizados

### GET /schools/{school_id}/daypass-authorizers
- **Parámetros**:
  - `authorizer_person_id`: ID del autorizador
  - `status`: Estado de los pases (por defecto "pendiente")
  - `page`: Número de página
  - `per_page`: Elementos por página

### PATCH /schools/{school_id}/daypasses/{daypass_id}/authorizers/{authorizer_person_id}
- **Body**:
  ```json
  {
    "authorized": true,
    "authorized_at": "2024-01-01T12:00:00Z"
  }
  ```

## Interfaces TypeScript

### IDaypass
```typescript
interface IDaypass {
  school_id: number;
  guardian_person_id: number;
  student_person_id: number;
  reason: string;
  status: 'PENDIENTE' | 'AUTORIZADO' | 'RECHAZADO' | 'COMPLETADO' | 'CANCELADO';
  authorized_at: string | null;
  academic_stage_id: number | null;
  daypass_date: string;
  daypass_time: string;
  id: number;
  created: string;
  modified: string;
  authorizers: IDaypassAuthorizer[];
  person: IPerson;
  relative: IPerson;
}
```

### IPerson
```typescript
interface IPerson {
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
  authorizer: IPerson;
}
```

## Servicios

### daypass.service.ts
- `getDaypassAuthorizers()`: Obtiene pases pendientes de autorización
- `authorizeDaypass()`: Autoriza un pase de salida
- `getDaypassById()`: Obtiene un pase específico

## Estados de la Aplicación

- **Loading**: Muestra spinner mientras carga datos
- **Error**: Muestra mensaje de error con opción de reintentar
- **Empty**: Muestra mensaje cuando no hay pases pendientes
- **Authorizing**: Estado durante la autorización de un pase

## Configuración

### Variables de Entorno
- `NEXT_PUBLIC_API_CONSULTATION_URL`: URL base de la API

### Configuración Temporal
- `schoolId`: ID de la escuela (actualmente hardcodeado como "1")
- `authorizerPersonId`: ID del autorizador (actualmente hardcodeado como "1")

**Nota**: Estas configuraciones deberían venir del contexto de la aplicación en una implementación completa.

## Uso

1. Navegar a la sección "Apps" > "Pase de Salida"
2. La aplicación cargará automáticamente los pases pendientes
3. Revisar la información de cada pase
4. Hacer clic en "Autorizar" para aprobar la solicitud
5. La lista se actualizará automáticamente

## Características de UX

- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Accesible**: Uso de iconos y colores para mejorar la comprensión
- **Feedback Visual**: Estados de carga y confirmación claros
- **Actualización Automática**: La lista se actualiza después de cada acción
- **Manejo de Errores**: Mensajes claros y opciones de reintento
