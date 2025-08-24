# Modo Mocking - Sistema de Comentarios

## Descripción

El sistema de comentarios incluye un modo de mocking completo que permite probar todas las funcionalidades sin necesidad de una API real. Esto es útil durante el desarrollo y testing.

## Características del Mocking

### ✅ Datos de Placeholder
- **3 comentarios de ejemplo** con contenido realista
- **Comentarios planos** - solo comentarios al aviso principal
- **Diferentes usuarios** con avatares y nombres
- **Sistema de likes** funcional
- **Fechas realistas** con timestamps

### ✅ Operaciones Simuladas
- **Crear comentarios** - Simula delay de 1 segundo
- **Editar comentarios** - Simula delay de 500ms
- **Eliminar comentarios** - Simula delay de 600ms
- **Like/Unlike** - Simula delay de 300ms
- **Cargar comentarios** - Simula delay de 800ms

### ✅ Indicadores Visuales
- **Badge "Mocking"** en el contador de comentarios
- **Mensaje informativo** cuando no hay comentarios
- **Estados de carga** realistas

## Datos de Ejemplo

### Comentarios Principales

1. **María García** - "¡Excelente aviso! Me parece muy importante esta información para todos los padres."
   - 8 likes, usuario actual le dio like

2. **Ana López** - "¿Podrían proporcionar más detalles sobre los horarios de la reunión?"
   - 5 likes, usuario actual no le dio like

3. **Roberto Martínez** - "Gracias por mantenernos informados. Es muy útil tener esta comunicación directa con la escuela."
   - 12 likes, usuario actual le dio like

## Cómo Activar/Desactivar Mocking

### Activar Mocking (Actual)
```typescript
// En CommentList.tsx, las operaciones de API están comentadas
// y se usan datos de placeholder
const mockComments: ICommentRead[] = [/* ... */];
```

### Desactivar Mocking (Producción)
```typescript
// Descomentar las llamadas reales a la API:
const response = await getByAnnouncement(schoolId, announcementId, pageNum, 10);
const createdComment = await create({ schoolId, dto: newComment });
await like({ schoolId, commentId });
await update({ schoolId, commentId, dto: { content } });
await remove({ schoolId, commentId });
```

## Funcionalidades Probadas

### ✅ CRUD Completo
- **Create**: Nuevos comentarios al aviso
- **Read**: Carga de comentarios con paginación
- **Update**: Edición de comentarios existentes
- **Delete**: Eliminación de comentarios

### ✅ Interacciones
- **Likes**: Dar y quitar likes
- **Comentarios**: Solo comentarios al aviso principal
- **Edición**: Modificar contenido propio
- **Eliminación**: Borrar comentarios propios

### ✅ Estados de UI
- **Loading**: Durante operaciones
- **Empty State**: Cuando no hay comentarios
- **Error Handling**: Manejo de errores
- **Responsive**: Adaptación a diferentes pantallas

## Ventajas del Mocking

1. **Desarrollo Rápido** - No depende de API externa
2. **Testing Completo** - Prueba todas las funcionalidades
3. **Demo Ready** - Listo para presentaciones
4. **Offline** - Funciona sin conexión
5. **Consistente** - Datos predecibles para testing

## Transición a Producción

Para cambiar de mocking a producción:

1. **Descomentar** las llamadas reales a la API
2. **Comentar** o eliminar los datos de placeholder
3. **Remover** los indicadores visuales de mocking
4. **Ajustar** los delays según la API real
5. **Configurar** manejo de errores real

## Archivos Afectados

- `src/components/CommentList.tsx` - Lógica principal de mocking
- `src/components/CommentItem.tsx` - Componente de comentario individual
- `src/components/CommentInput.tsx` - Input para nuevos comentarios
- `src/interfaces/IComment.ts` - Interfaces de datos
- `src/services/comment.service.ts` - Servicios de API (preparados para producción)
