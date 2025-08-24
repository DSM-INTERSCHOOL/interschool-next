# Servicios de Anuncios

Este directorio contiene los servicios relacionados con la gestión de anuncios escolares, basados en la especificación de la API de comunicación.

## Archivos

### `announcement.service.ts`
Servicio principal para la gestión de anuncios que incluye:

- **CRUD básico**: Crear, leer, actualizar y eliminar anuncios
- **Gestión de personas**: Agregar/remover personas de anuncios
- **Sistema de likes**: Dar/quitar likes y obtener lista de likes
- **Sistema de vistas**: Registrar y obtener vistas de anuncios
- **Sistema de comentarios**: CRUD completo de comentarios

### `communicationApi.ts`
Configuración de axios para la API de comunicación.

### `announcement.service.example.ts`
Ejemplos de uso del servicio de anuncios con casos prácticos.

## Interfaces

### `IAnnouncementCreate`
Interfaz para crear un nuevo anuncio:
```typescript
{
  title?: string | null;
  content?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  accept_comments?: boolean;
  authorized?: boolean;
  academic_year?: string | null;
  academic_stages?: string[] | null;
  publisher_person_id: string;
  persons: string[];
  // ... más campos
}
```

### `IAnnouncementRead`
Interfaz para leer un anuncio (incluye campos generados por el servidor):
```typescript
{
  id: string; // UUID
  school_id: number;
  created_at: string | null;
  modified_at: string | null;
  // ... todos los campos de IAnnouncementCreate
}
```

## Uso Básico

```typescript
import { create, getAll, getById, update, remove } from './announcement.service';

// Crear un anuncio
const newAnnouncement = await create({
  schoolId: 1,
  dto: {
    title: "Reunión de padres",
    content: "Se convoca a todos los padres",
    publisher_person_id: "user-123",
    persons: ["person-1", "person-2"],
  }
});

// Obtener todos los anuncios
const announcements = await getAll({
  schoolId: 1,
  page: 1,
  per_page: 20
});

// Obtener un anuncio específico
const announcement = await getById({
  schoolId: 1,
  announcementId: "announcement-uuid"
});
```

## Funcionalidades Avanzadas

### Gestión de Likes
```typescript
import { like, unlike, getLikes } from './announcement.service';

// Dar like
await like({
  schoolId: 1,
  announcementId: "announcement-uuid",
  personId: "person-123"
});

// Obtener likes
const likes = await getLikes({
  schoolId: 1,
  announcementId: "announcement-uuid"
});
```

### Gestión de Comentarios
```typescript
import { addComment, getComments, updateComment, removeComment } from './announcement.service';

// Agregar comentario
await addComment({
  schoolId: 1,
  announcementId: "announcement-uuid",
  dto: {
    person_id: "person-123",
    comment: "Excelente información"
  }
});

// Obtener comentarios
const comments = await getComments({
  schoolId: 1,
  announcementId: "announcement-uuid"
});
```

### Gestión de Personas
```typescript
import { addPersons, removePersons, getPersons } from './announcement.service';

// Agregar personas
await addPersons({
  schoolId: 1,
  announcementId: "announcement-uuid",
  dto: {
    persons: ["person-4", "person-5"]
  }
});

// Obtener personas del anuncio
const persons = await getPersons({
  schoolId: 1,
  announcementId: "announcement-uuid"
});
```

## Configuración

El servicio utiliza la variable de entorno `NEXT_PUBLIC_API_COMMUNICATION_URL` para la URL base de la API. Si no está definida, usa `http://localhost:8000/v1` por defecto.

```env
NEXT_PUBLIC_API_COMMUNICATION_URL=http://localhost:8000/v1
```

## Manejo de Errores

Todos los métodos del servicio pueden lanzar errores de axios. Es recomendable usar try-catch para manejar los errores:

```typescript
try {
  const announcement = await create({
    schoolId: 1,
    dto: announcementData
  });
} catch (error) {
  console.error('Error al crear anuncio:', error);
  // Manejar el error apropiadamente
}
```

## Paginación

Los métodos que devuelven listas soportan paginación:

```typescript
const announcements = await getAll({
  schoolId: 1,
  page: 1,        // Página actual
  per_page: 20,   // Elementos por página
  filters: "status=active" // Filtros opcionales
});
```

## Filtros

Algunos endpoints soportan filtros como parámetro de consulta:

```typescript
const announcements = await getAll({
  schoolId: 1,
  filters: "status=active&authorized=true"
});
```

## Tipos de Respuesta

- **CRUD básico**: Devuelve `IAnnouncementRead`
- **Listas**: Devuelven arrays de `IAnnouncementRead`
- **Likes**: Devuelven `IAnnouncementLikeRead`
- **Comentarios**: Devuelven arrays de comentarios
- **Personas**: Devuelven arrays de personas
- **Vistas**: Devuelven arrays de vistas


