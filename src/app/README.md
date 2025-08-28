# Página Raíz - Redirect Automático

## Descripción

La página raíz (`/`) del sistema Interschool implementa un redirect automático basado en el estado de autenticación del usuario. Esta página actúa como un punto de entrada inteligente que dirige a los usuarios a la ubicación apropiada.

## Funcionalidad

### Lógica de Redirect

1. **Usuario Autenticado** → Redirige a `/home`
2. **Usuario No Autenticado** → Redirige a `/auth/login`

### Flujo de Ejecución

1. **Carga Inicial**: Muestra un loading spinner
2. **Hidratación**: Espera a que el estado se hidrate completamente
3. **Verificación**: Determina si el usuario está autenticado
4. **Redirect**: Navega a la página correspondiente

## Implementación Técnica

### Componentes Utilizados

- **`useAuthStore`**: Para verificar el estado de autenticación
- **`useHydration`**: Para asegurar que el estado esté hidratado
- **`useRouter`**: Para realizar la navegación
- **`LoadingSpinner`**: Para mostrar estado de carga

### Código Clave

```typescript
useEffect(() => {
    if (isHydrated) {
        if (isAuthenticated) {
            router.push('/home');
        } else {
            router.push('/auth/login');
        }
    }
}, [isHydrated, isAuthenticated, router]);
```

## Estados de la Página

### 1. Estado de Carga
- **Duración**: Mientras se hidrata el estado
- **UI**: Loading spinner con mensaje "Cargando..."
- **Comportamiento**: No permite interacción

### 2. Estado de Redirect
- **Duración**: Mientras se ejecuta la navegación
- **UI**: Loading spinner (breve)
- **Comportamiento**: Redirección automática

## Beneficios

1. **✅ Experiencia de Usuario Mejorada**: No hay páginas intermedias innecesarias
2. **✅ Seguridad**: Usuarios no autenticados van directamente al login
3. **✅ Eficiencia**: Usuarios autenticados van directamente a la aplicación
4. **✅ Consistencia**: Comportamiento predecible en todas las visitas

## Casos de Uso

### Escenario 1: Usuario Nuevo
1. Accede a `http://localhost:3000/`
2. Ve loading spinner
3. Es redirigido a `/auth/login`

### Escenario 2: Usuario Autenticado
1. Accede a `http://localhost:3000/`
2. Ve loading spinner
3. Es redirigido a `/home`

### Escenario 3: Usuario con Sesión Activa
1. Accede a `http://localhost:3000/`
2. Ve loading spinner
3. Es redirigido a `/home` (sesión recuperada)

## Consideraciones Técnicas

- **Hidratación**: Es crucial esperar a que el estado se hidrate para evitar redirects incorrectos
- **Performance**: El redirect es rápido y eficiente
- **SEO**: Esta página no está diseñada para SEO ya que es un redirect automático
- **Accesibilidad**: El loading spinner proporciona feedback visual al usuario

## Estructura de Archivos

```
src/app/
├── page.tsx          # Página raíz con redirect
└── README.md         # Documentación
```
