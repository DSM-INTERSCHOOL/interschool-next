# Componentes Reutilizables

Esta carpeta contiene componentes reutilizables que pueden ser utilizados en diferentes partes de la aplicación.

## Componentes Disponibles

### DeleteConfirmationModal

Un modal elegante y reutilizable para confirmar acciones de eliminación.

**Características:**
- Diseño moderno con iconos de advertencia
- Animaciones suaves
- Estados de carga
- Personalizable (título, mensaje, nombre del elemento)
- Fondo transparente con blur

**Props:**
- `isOpen: boolean` - Controla la visibilidad del modal
- `onClose: () => void` - Función llamada al cerrar
- `onConfirm: () => void` - Función llamada al confirmar
- `title?: string` - Título del modal (default: "Confirmar Eliminación")
- `message?: string` - Mensaje principal (default: "¿Estás seguro de que deseas eliminar este elemento?")
- `itemName?: string` - Nombre del elemento a eliminar
- `loading?: boolean` - Estado de carga (default: false)

**Ejemplo de uso:**
```tsx
<DeleteConfirmationModal
    isOpen={showDeleteModal}
    onClose={() => setShowDeleteModal(false)}
    onConfirm={handleDelete}
    title="Eliminar Usuario"
    message="¿Estás seguro de que deseas eliminar este usuario?"
    itemName="Juan Pérez"
    loading={deleteLoading}
/>
```

### CommentInput

Componente para la entrada de comentarios con funcionalidad de envío.

**Características:**
- Input de texto con validación
- Botón de envío con estado de carga
- Personalizable (placeholder, estado disabled)
- Diseño consistente con el tema

**Props:**
- `onSendComment: (content: string) => void` - Función llamada al enviar
- `placeholder?: string` - Texto del placeholder (default: "Escribe un comentario...")
- `disabled?: boolean` - Estado deshabilitado (default: false)
- `loading?: boolean` - Estado de carga (default: false)
- `className?: string` - Clases CSS adicionales

**Ejemplo de uso:**
```tsx
<CommentInput
    onSendComment={(content) => console.log("Comentario:", content)}
    placeholder="Escribe tu opinión..."
    loading={sending}
    disabled={!isAuthenticated}
/>
```

### CommentItem

Componente para mostrar un comentario individual con todas sus funcionalidades.

**Características:**
- Avatar del autor
- Información del autor y fecha
- Contenido editable (para el autor)
- Sistema de likes
- Menú de opciones (editar, eliminar)
- Modal de confirmación para eliminación

**Props:**
- `comment: ICommentRead` - Datos del comentario
- `onLike?: (commentId: string) => void` - Función para like/unlike
- `onEdit?: (commentId: string, content: string) => void` - Función para editar
- `onDelete?: (commentId: string) => void` - Función para eliminar
- `currentUserId?: string` - ID del usuario actual
- `className?: string` - Clases CSS adicionales

**Ejemplo de uso:**
```tsx
<CommentItem
    comment={commentData}
    onLike={handleLike}
    onEdit={handleEdit}
    onDelete={handleDelete}
    currentUserId="user-123"
/>
```

### CommentList

Componente principal para mostrar y gestionar una lista completa de comentarios.

**Características:**
- Lista paginada de comentarios
- Input para nuevos comentarios
- Contador de comentarios
- Estados de carga
- Carga infinita (botón "Cargar más")
- Gestión completa de CRUD
- Comentarios planos (solo al aviso principal)
- Integración con servicios de API

**Props:**
- `announcementId: string` - ID del aviso/entrada
- `schoolId: number` - ID de la escuela
- `currentUserId?: string` - ID del usuario actual
- `allowComments?: boolean` - Permitir nuevos comentarios (default: true)
- `className?: string` - Clases CSS adicionales

**Ejemplo de uso:**
```tsx
<CommentList
    announcementId="announcement-123"
    schoolId={1}
    currentUserId="user-456"
    allowComments={true}
/>
```

## Servicios Relacionados

Los componentes de comentarios utilizan los siguientes servicios:

### comment.service.ts

Servicios para gestionar comentarios:

- `create` - Crear nuevo comentario
- `getAll` - Obtener todos los comentarios (con paginación)
- `getById` - Obtener comentario por ID
- `getByAnnouncement` - Obtener comentarios de un aviso específico
- `update` - Actualizar comentario
- `remove` - Eliminar comentario
- `like` - Dar like a un comentario
- `unlike` - Quitar like de un comentario

### Interfaces

- `ICommentCreate` - Para crear comentarios
- `ICommentRead` - Para leer comentarios
- `ICommentUpdate` - Para actualizar comentarios
- `ICommentLikeRead` - Para likes de comentarios

## Características del Sistema de Comentarios

### Funcionalidades Principales

1. **Comentarios Planos**: Solo comentarios al aviso principal
2. **Sistema de Likes**: Los usuarios pueden dar/quitar likes
3. **Edición en Línea**: Los autores pueden editar sus comentarios
4. **Eliminación Segura**: Modal de confirmación para eliminar
5. **Paginación**: Carga eficiente de comentarios
6. **Estados de Carga**: Feedback visual durante operaciones
7. **Validación**: Validación de contenido antes de enviar

### Diseño y UX

- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Soporte para navegación por teclado
- **Consistente**: Diseño coherente con el resto de la aplicación
- **Intuitivo**: Interfaz fácil de usar

### Integración

Los componentes están diseñados para integrarse fácilmente con:
- Sistema de autenticación
- API de comunicación
- Gestión de estado global
- Sistema de notificaciones

## Ejemplos de Uso

Ver `CommentList.example.tsx` para ejemplos completos de uso de todos los componentes.
