# Home - Página Principal

## Descripción

Esta es la nueva página principal del sistema Interschool. Reemplaza la página anterior de dashboard y sirve como punto de entrada principal para los usuarios autenticados. Está ubicada dentro del layout principal para que el menú de navegación sea visible.

## Características

- **Página de Bienvenida**: Mensaje de bienvenida al sistema
- **Información de Desarrollo**: Indica que es una nueva interfaz en construcción
- **Características Destacadas**: Muestra las mejoras de la nueva plataforma
- **Diseño Moderno**: Utiliza componentes hero y cards para una presentación atractiva
- **Navegación Completa**: Acceso al menú principal y todas las funcionalidades

## Funcionalidades

### Secciones Principales

1. **Hero Section**
   - Título principal: "Nueva Interfaz del Sistema Interschool"
   - Descripción del proyecto
   - Icono de escuela

2. **Características Destacadas**
   - **Más Rápida**: Interfaz optimizada
   - **Responsive**: Diseño adaptable
   - **Más Segura**: Mejoras en seguridad

3. **Alert de Construcción**
   - Indica que la interfaz está en desarrollo
   - Mensaje informativo para usuarios

4. **Badge de Estado**
   - Indica "Próximamente"

## Navegación

- **URL**: `/home`
- **Acceso**: Después del login exitoso
- **Logo**: El logo del sidebar redirige a esta página
- **Layout**: Dentro del layout principal con menú visible
- **Navegación**: Acceso completo a "Pases de Salida" y otras funcionalidades

## Estructura de Archivos

```
src/app/(admin)/home/
├── page.tsx          # Página principal
└── README.md         # Documentación
```

## Layout y Navegación

- **Layout Principal**: Utiliza el layout `(admin)` con sidebar
- **Menú Visible**: Sidebar con navegación completa
- **Breadcrumbs**: Muestra "Home" como página activa
- **Responsive**: Adaptable a todos los dispositivos

## Tecnologías Utilizadas

- Next.js 15
- TypeScript
- DaisyUI
- Tailwind CSS
- Iconify (Lucide icons)

## Redirecciones Actualizadas

- **Login exitoso**: Redirige a `/home` por defecto
- **Logo del sidebar**: Redirige a `/home`
- **Middleware**: Permite acceso a usuarios autenticados
- **Layout**: Incluido en el layout principal con navegación
