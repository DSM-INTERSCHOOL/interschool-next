# Mis Autorizaciones - Aplicación de Autorización

## Descripción
Aplicación para gestionar la autorización de pases de salida de estudiantes. Los usuarios con rol de autorizador pueden visualizar y autorizar pases de salida pendientes.

## Características Principales

### 🔐 **Autenticación Real**
- ✅ **Endpoint Real**: `https://core-api.idsm.xyz/schools/{school_id}/daypass-authorizers`
- ✅ **Headers Requeridos**: 
  - `x-device-id: mobile-web-client`
  - `x-url-origin: https://admin.celta.interschool.mx`
  - `Authorization: Bearer {token}`
- ✅ **Parámetros**: `authorizer_person_id`, `status=pendiente`

### 📋 **Funcionalidades**
- **Visualización de Pases Pendientes**: Muestra todos los pases de salida que requieren autorización
- **Secuencia de Autorización**: Visualiza los pasos de autorización con opciones específicas
- **Autorización Interactiva**: Permite seleccionar opciones y autorizar pases
- **Confirmación Modal**: Modal de confirmación antes de autorizar
- **Diseño Responsivo**: Grid adaptativo para diferentes tamaños de pantalla
- **Compatibilidad Dark Mode**: Diseño que se adapta automáticamente al tema

### 🎨 **Interfaz de Usuario**
- **Cards Simplificados**: Diseño limpio usando `bg-base-100 card card-border`
- **Radio Buttons**: Selección única por card con nombres únicos
- **Estados Visuales**: Indicadores claros para pasos completados, actuales y pendientes
- **Botón de Autorización**: Siempre visible, deshabilitado si no hay selección

## Estructura de Datos

### **IDaypassAuthorizer** (Respuesta del API)
```typescript
interface IDaypassAuthorizer {
  daypass: IDaypass;           // Información del pase de salida
  authorizer: IPerson;         // Información del autorizador
  daypass_config: IDaypassConfig; // Configuración de secuencia
  authorization_sequence: number;  // Secuencia actual
}
```

### **IDaypass** (Información del Pase)
```typescript
interface IDaypass {
  id: number;
  school_id: number;
  guardian_person_id: number;
  student_person_id: number;
  reason: string;
  status: "PENDIENTE" | "AUTORIZADO" | "CANCELADO";
  daypass_date: string;
  daypass_time: string;
  person: IPerson;      // Estudiante
  relative: IPerson;    // Solicitante/Familiar
}
```

### **IDaypassConfig** (Configuración de Secuencia)
```typescript
interface IDaypassConfig {
  authorization_sequence: {
    "0": {
      options: {
        "CC": { action: "AUTHORIZE_AND_FORWARD", description: "..." },
        "KI": { action: "AUTHORIZE_AND_CLOSE", description: "..." }
      },
      description: "Recepción Asistente de Dirección",
      person_authorizer_id: 4487
    }
  }
}
```

## Endpoints Utilizados

### **GET** `/schools/{school_id}/daypass-authorizers`
- **Propósito**: Obtener pases de salida pendientes de autorización
- **Parámetros**:
  - `authorizer_person_id`: ID del autorizador
  - `status`: "pendiente"
- **Headers**:
  - `x-device-id: mobile-web-client`
  - `x-url-origin: https://admin.celta.interschool.mx`
  - `Authorization: Bearer {token}`

### **PUT** `/schools/{school_id}/daypass-authorizers/{daypass_id}`
- **Propósito**: Autorizar un pase de salida
- **Body**:
  ```json
  {
    "authorizer_person_id": "8121",
    "action": "CC"
  }
  ```
- **Headers**: Mismos que GET

## Componentes Principales

### **DaypassApp.tsx**
- Componente principal que maneja el estado global
- Gestiona la carga de datos y autorizaciones
- Renderiza el grid de cards

### **DaypassCard.tsx**
- Renderiza un card individual de pase de salida
- Muestra información del estudiante, solicitante y secuencia
- Maneja la selección de opciones y autorización

### **AuthorizationOptions.tsx**
- Componente para las opciones de radio button
- Maneja la selección única por grupo
- Estilos adaptables al tema

### **AuthorizationConfirmationModal.tsx**
- Modal de confirmación antes de autorizar
- Muestra información del estudiante y opción seleccionada

## Manejo de Errores

### **Errores de Red**
- **401**: "No tienes permisos para acceder a esta información"
- **404**: "No se encontraron pases de salida"
- **NETWORK_ERROR**: "Error de conexión. Verifica tu conexión a internet"

### **Errores de Autorización**
- **401**: "No tienes permisos para autorizar este pase de salida"
- **404**: "El pase de salida no fue encontrado"
- **400**: "Datos de autorización inválidos"

## Configuración

### **Variables de Entorno**
```env
NEXT_PUBLIC_API_CONSULTATION_URL=https://core-api.idsm.xyz
```

### **Autenticación**
- El token se obtiene del store de autenticación
- Se incluye automáticamente en todas las peticiones
- Manejo automático de errores 401 con logout

## Uso

1. **Acceso**: Navegar a `/apps/daypass`
2. **Autenticación**: Debe estar logueado con token válido
3. **Visualización**: Los pases pendientes se cargan automáticamente
4. **Selección**: Elegir una opción de autorización (radio button)
5. **Autorización**: Hacer clic en "Autorizar" y confirmar en el modal
6. **Actualización**: Los datos se recargan automáticamente después de autorizar

## Notas Técnicas

- **Agrupación**: Los datos se agrupan por `daypass_id` para mostrar un card por pase
- **Nombres Únicos**: Cada grupo de radio buttons tiene un nombre único para evitar conflictos
- **Estado Local**: La selección se mantiene en el estado local del componente
- **Responsive**: Grid de 1 columna en móvil, 2 en tablet, 3 en desktop
- **Tema**: Compatible con modo claro y oscuro usando clases DaisyUI
