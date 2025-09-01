# Página de Consulta - Pases de Salida

## Descripción

La página de Consulta permite buscar y filtrar pases de salida con múltiples criterios. Proporciona una interfaz completa para consultar información detallada sobre los pases de salida incluyendo datos del estudiante, pariente, fechas, estados y autorizadores.

## Funcionalidades

### 🔍 Búsqueda y Filtros
- **Búsqueda general**: Busca por nombre del estudiante, matrícula, nombre del pariente o motivo
- **Filtro por estado**: PENDIENTE, AUTORIZADO, RECHAZADO, CANCELADO
- **Filtro por fechas**: Rango de fechas desde/hasta
- **Filtro por ID**: ID del estudiante o ID del pariente
- **Búsqueda en tiempo real**: Filtrado local de resultados

### 📊 Tabla de Resultados
- **Información completa**: ID, estudiante, matrícula, pariente, motivo, fecha, hora, estado
- **Estados visuales**: Badges con colores para cada estado
- **Resumen de autorizadores**: Cantidad total y autorizados
- **Formato de datos**: Fechas y horas formateadas para mejor legibilidad

### 🎨 Interfaz de Usuario
- **Diseño responsive**: Adaptable a diferentes tamaños de pantalla
- **Loading states**: Indicadores de carga durante las peticiones
- **Manejo de errores**: Mensajes claros cuando ocurren errores
- **Estados vacíos**: Mensaje cuando no hay resultados

## Estructura de Archivos

```
src/app/(admin)/apps/daypass/consulta/
├── page.tsx              # Página principal
├── ConsultaApp.tsx       # Componente principal con lógica
└── README.md            # Esta documentación
```

## Componentes

### ConsultaApp.tsx
Componente principal que maneja toda la lógica de la pantalla de consulta.

#### Estados
- `daypasses`: Array de pases de salida
- `loading`: Estado de carga
- `error`: Mensaje de error
- `searchTerm`: Término de búsqueda local
- `filters`: Filtros aplicados

#### Funciones Principales
- `loadDaypasses()`: Carga datos desde la API
- `handleSearch()`: Ejecuta búsqueda con filtros
- `handleFilterChange()`: Actualiza filtros
- `handleClearFilters()`: Limpia todos los filtros
- `filteredDaypasses`: Filtra resultados localmente

## Servicios Utilizados

### daypass-consulta.service.ts
- `getDaypassesConsulta()`: Obtiene pases de salida con filtros
- `validateConsultaParams()`: Valida parámetros antes de la petición
- `formatDateForAPI()`: Formatea fechas para la API

## Filtros Disponibles

### Búsqueda General
- Busca en: nombre del estudiante, matrícula, nombre del pariente, motivo
- Funciona con búsqueda parcial (incluye)
- No distingue mayúsculas/minúsculas

### Estado
- **PENDIENTE**: Pases pendientes de autorización
- **AUTORIZADO**: Pases autorizados
- **RECHAZADO**: Pases rechazados
- **CANCELADO**: Pases cancelados

### Fechas
- **Fecha desde**: Fecha de inicio del rango
- **Fecha hasta**: Fecha de fin del rango
- Formato: YYYY-MM-DD
- Validación automática de rangos

### IDs
- **ID Estudiante**: ID específico del estudiante
- **ID Pariente**: ID específico del pariente/solicitante

## Validaciones

### Parámetros
- Fecha de inicio no puede ser mayor a fecha de fin
- IDs deben ser válidos
- Validación automática antes de enviar peticiones

### Errores
- **401**: Sin permisos de acceso
- **403**: Acceso denegado
- **404**: No se encontraron pases
- **422**: Parámetros inválidos
- **500**: Error interno del servidor
- **Network Error**: Problemas de conexión

## Tecnologías

- **React**: Hooks (useState, useEffect)
- **TypeScript**: Tipado fuerte para interfaces
- **Tailwind CSS**: Estilos y responsive design
- **DaisyUI**: Componentes de UI
- **Axios**: Peticiones HTTP
- **Iconify**: Iconos

## Navegación

La página es accesible desde:
- Menú principal → Apps → Pases de Salida → Consulta
- URL: `/apps/daypass/consulta`

## Responsive Design

- **Desktop**: 3 columnas en filtros, tabla completa
- **Tablet**: 2 columnas en filtros, tabla con scroll horizontal
- **Mobile**: 1 columna en filtros, tabla con scroll horizontal

## Estados de Carga

1. **Carga inicial**: Loading spinner con mensaje
2. **Búsqueda**: Botón con spinner, tabla con overlay
3. **Sin resultados**: Mensaje con icono de inbox vacío
4. **Error**: Alert con mensaje específico del error

## Mejoras Futuras

- [ ] Paginación de resultados
- [ ] Exportar a Excel/PDF
- [ ] Filtros avanzados (por autorizador)
- [ ] Vista detallada de cada pase
- [ ] Historial de búsquedas
- [ ] Filtros guardados
