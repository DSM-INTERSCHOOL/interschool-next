# Sección de Publicaciones

Esta sección proporciona una interfaz completa para gestionar todas las publicaciones, avisos y comunicaciones de la escuela.

## Estructura

```
publications/
├── page.tsx                    # Página principal
├── PublicationsApp.tsx         # Componente principal con navegación por pestañas
├── components/
│   ├── AnnouncementsTab.tsx    # Gestión de avisos
│   ├── CreateAnnouncementModal.tsx # Modal de creación de avisos
│   ├── AnnouncementCard.tsx    # Tarjeta de visualización de avisos
│   ├── FeedTab.tsx            # Feed de publicaciones (placeholder)
│   ├── EventsTab.tsx          # Gestión de eventos (placeholder)
│   └── DocumentsTab.tsx       # Gestión de documentos (placeholder)
└── README.md                  # Esta documentación
```

## Funcionalidades

### 🎯 **Pestaña de Avisos (Implementada)**

#### Características principales:
- **Lista de avisos** con búsqueda y filtros
- **Creación de avisos** con formulario completo
- **Visualización de avisos** en tarjetas informativas
- **Gestión de likes** y estadísticas
- **Estados de autorización** (Pendiente, Autorizado, Activo)

#### Formulario de creación incluye:
- **Información básica**: Título, contenido, fechas
- **Configuración académica**: Etapas, programas, modalidades, grupos
- **Opciones avanzadas**: Comentarios, autorización
- **Validación completa** de campos requeridos

#### Campos del formulario:
- ✅ Título (requerido)
- ✅ Contenido (requerido)
- ✅ Fecha de inicio y fin (requeridas)
- ✅ Permitir comentarios (opcional)
- ✅ Autorización (opcional)
- ✅ Año académico
- ✅ Etapas académicas (múltiple selección)
- ✅ Programas académicos (múltiple selección)
- ✅ Modalidades (múltiple selección)
- ✅ Años de programa (múltiple selección)
- ✅ Grupos académicos (múltiple selección)

### 📋 **Otras Pestañas (Placeholders)**

#### Feed de Publicaciones
- Feed en tiempo real de todas las publicaciones
- Actualizaciones de la comunidad escolar
- Integración con otras secciones

#### Gestión de Eventos
- Creación y gestión de eventos escolares
- Calendarios y recordatorios
- Actividades extraescolares

#### Gestión de Documentos
- Subida y organización de documentos
- Biblioteca digital
- Compartir archivos de forma segura

## Integración con Servicios

La sección utiliza los servicios de anuncios creados anteriormente:

```typescript
import { 
    create, 
    getAll, 
    getById, 
    update, 
    remove,
    like,
    unlike,
    addComment,
    getComments
} from '@/services/announcement.service';
```

## Uso

### Acceso a la sección:
1. Navegar a `/admin/apps/publications`
2. La sección se encuentra en el menú de aplicaciones

### Crear un aviso:
1. Hacer clic en "Crear Aviso"
2. Completar el formulario con la información requerida
3. Configurar la audiencia académica
4. Revisar y enviar

### Gestionar avisos existentes:
1. Usar la búsqueda para encontrar avisos específicos
2. Aplicar filtros por estado
3. Interactuar con likes y comentarios
4. Editar o eliminar desde el menú de opciones

## Características Técnicas

### 🎨 **UI/UX**
- **Diseño responsivo** con DaisyUI y Tailwind CSS
- **Navegación por pestañas** con Headless UI
- **Modales** para formularios complejos
- **Estados de carga** y feedback visual
- **Validación en tiempo real** de formularios

### 🔧 **Funcionalidades**
- **Búsqueda y filtrado** de avisos
- **Paginación** para listas grandes
- **Estados de autorización** con badges visuales
- **Estadísticas** de engagement (likes, vistas, comentarios)
- **Gestión de archivos adjuntos** (preparado para implementación)

### 📱 **Responsive Design**
- **Mobile-first** approach
- **Adaptación** a diferentes tamaños de pantalla
- **Navegación táctil** optimizada

## Configuración

### Variables de entorno requeridas:
```env
NEXT_PUBLIC_API_COMMUNICATION_URL=http://localhost:8000/v1
```

### Dependencias:
- `@headlessui/react` - Para componentes de UI
- `axios` - Para llamadas a la API
- `@heroicons/react` - Para iconos

## Próximas Mejoras

### 🚀 **Funcionalidades Planificadas**
- [ ] **Sistema de comentarios** completo
- [ ] **Notificaciones** en tiempo real
- [ ] **Subida de archivos** adjuntos
- [ ] **Plantillas** de avisos
- [ ] **Programación** de publicaciones
- [ ] **Analytics** de engagement
- [ ] **Exportación** de reportes

### 🔄 **Integraciones Futuras**
- [ ] **Sistema de eventos** completo
- [ ] **Gestión de documentos** avanzada
- [ ] **Feed social** integrado
- [ ] **Notificaciones push**
- [ ] **API de terceros** (calendarios, etc.)

## Desarrollo

### Estructura de datos:
```typescript
interface IAnnouncementRead {
    id: string;
    title?: string;
    content?: string;
    start_date?: string;
    end_date?: string;
    accept_comments?: boolean;
    authorized?: boolean;
    academic_year?: string;
    academic_stages?: string[];
    // ... más campos
}
```

### Patrones utilizados:
- **Componentes funcionales** con hooks
- **Estado local** para UI
- **Servicios** para lógica de negocio
- **Interfaces TypeScript** para tipado
- **Validación** de formularios
- **Manejo de errores** robusto

## Contribución

Para agregar nuevas funcionalidades:

1. **Crear componentes** en el directorio `components/`
2. **Implementar servicios** en `src/services/`
3. **Actualizar interfaces** en `src/interfaces/`
4. **Documentar cambios** en este README
5. **Probar** en diferentes dispositivos

