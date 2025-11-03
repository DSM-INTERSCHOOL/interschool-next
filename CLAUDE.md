# CLAUDE.md - Interschool Next.js Application

## Project Overview

**Interschool Next** is a modern school management system built with Next.js, serving as a new interface replacement for a legacy system. This is primarily a daypass (pases de salida) authorization system for students, with additional infrastructure for future school management features.

### Key Information
- **Project Name**: `interschool-next`
- **Version**: 2.0.0
- **Framework**: Next.js 15.1.6 with App Router
- **Node Version**: >=18.18.0
- **Type**: ESM (`"type": "module"`)

## Tech Stack

### Core Technologies
- **Framework**: Next.js 15.1.6 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.7.3
- **CSS Framework**: Tailwind CSS 4.0.3 + DaisyUI 5.0.0-beta.6
- **State Management**: Zustand 5.0.7
- **HTTP Client**: Axios 1.11.0

### UI Components & Libraries
- **Headless UI**: @headlessui/react 2.2.7
- **Icons**: @heroicons/react, @iconify packages
- **Charts**: ApexCharts + react-apexcharts
- **File Upload**: FilePond + react-filepond
- **Scrollbars**: simplebar-react

### Development Tools
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with Tailwind plugin and import sorting
- **Build**: Next.js with TypeScript strict mode
- **Package Manager**: NPM/Yarn/Bun compatible

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin routes with protected layout
│   │   ├── (layout)/             # Layout components (Sidebar, Topbar, etc.)
│   │   ├── apps/                 # Main applications
│   │   │   └── daypass/          # Daypass authorization system
│   │   ├── home/                 # Admin home page
│   │   └── layout.tsx            # Admin layout wrapper
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── landing/                  # Landing page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root page (redirects based on auth)
├── components/                   # Reusable UI components
├── contexts/                     # React contexts (config)
├── hooks/                        # Custom React hooks
├── interfaces/                   # TypeScript interfaces
│   ├── DTOs/                     # Data Transfer Objects
│   ├── IDaypass.ts               # Daypass interfaces
│   └── ...                       # Other domain interfaces
├── lib/                          # Utility libraries
├── services/                     # API services
├── store/                        # Zustand stores
├── styles/                       # CSS files
└── specs/                        # Test specifications
```

## Authentication & Authorization

### Authentication Flow
1. **Root Redirect**: `/` checks auth status and redirects to `/home` or `/auth/login`
2. **Middleware**: Protects all routes except auth and landing pages
3. **Protected Routes**: Use `<ProtectedRoute>` component that checks auth and hydration
4. **Token Storage**: JWT tokens stored in localStorage via Zustand persistence

### Key Authentication Components
- **Store**: `useAuthStore` (Zustand) - Main auth state management
- **Hook**: `useAuth` - Convenient auth operations wrapper
- **Service**: `auth.service.ts` - API authentication calls
- **Middleware**: `middleware.ts` - Route protection
- **Component**: `<ProtectedRoute>` - Client-side auth guard

### Authentication State Structure
```typescript
interface AuthState {
  // Core auth data
  token: string | null;
  personId: number | null;
  email: string | null;
  name: string | null;
  schoolId: number | null;
  
  // Additional user data
  personInternalId: string | null;
  status: string | null;
  personType: string | null;
  personPhoto: string | null;
  timeZone: string | null;
  lastLogin: string | null;
  
  // Legacy support
  permisos: Permiso[];
  legacyUrl: string;
}
```

## Main Application Features

### 1. Daypass Authorization System
**Purpose**: Handle student exit pass authorizations

**Key Files**:
- `/apps/daypass/` - Main daypass pages
- `/apps/daypass/consulta/` - Daypass consultation
- `daypass.service.ts` - API integration
- `IDaypass.ts` - Type definitions

**Workflow**:
1. Parents/guardians request exit passes for students
2. Authorizers (teachers/admin) review and approve/deny
3. Multi-step authorization sequence support
4. Real-time status tracking

### 2. Configuration System

#### Theme Management
Light/Dark themes with system preference support
- Context: `ConfigProvider` in `contexts/config.tsx`
- Themes: `["light", "contrast", "material", "dark", "dim", "system"]`
- Persistence: LocalStorage with key `__NEXUS_CONFIG_v2.0__`

#### Dynamic Organization Configuration
Multi-school support via dynamic configuration
- **Query Parameter**: `?org=BASE64_ENCODED_VALUE` (format: `schoolId_portalCode`)
- **Storage**: `schoolId` and `portalName` stored in localStorage
- **Helper**: `getOrgConfig()` function in `lib/orgConfig.ts`
- **Portal Codes**: MT (Meta), ST (Student), TC (Teacher)
- **Example**: `?org=MTAwMF9NVA%3D%3D` decodes to `1000_MT`

**Configuration Flow**:
1. User accesses root page with `org` query parameter
2. Value is decoded from base64 and split into `schoolId` and `portalCode`
3. Portal name is mapped from `orgsMap` configuration
4. Values are stored in localStorage for subsequent requests
5. All API services use `getOrgConfig()` to retrieve dynamic values
6. Axios interceptors automatically inject `x-url-origin` header

**Error Handling**:
- Missing or invalid `org` parameter shows "Acceso no autorizado" message
- No default values - requires valid `org` parameter on first access

## API Integration

### Base Configuration
- **Base URL**: Configured via `NEXT_PUBLIC_API_CONSULTATION_URL`
- **School ID**: Dynamically obtained from `org` query parameter
- **Portal Origin**: Dynamically obtained from `org` query parameter
- **Authentication**: Bearer tokens via axios interceptors
- **Error Handling**: Automatic 401 redirect to login

### Key Services
- `api.ts` - Axios instance with auth interceptors
- `auth.service.ts` - Authentication endpoints
- `daypass.service.ts` - Daypass CRUD operations
- `daypass-consulta.service.ts` - Daypass queries

### Environment Variables
```env
NEXT_PUBLIC_API_CONSULTATION_URL=https://core-api.idsm.xyz/schools
NEXT_PUBLIC_API_COURSE_URL=https://course-api.idsm.xyz/schools
NEXT_PUBLIC_API_CATALOGS_URL=http://cudec-testing.interschool-services.com.mx:8888
NEXT_PUBLIC_API_BASE_URL=https://core-api.idsm.xyz
NEXT_PUBLIC_API_COMMUNICATION_URL=https://stage.communication.idsm.xyz
```

**Note**: `NEXT_PUBLIC_SCHOOL_ID` and `NEXT_PUBLIC_X_URL_ORIGIN` are no longer used. These values are now dynamically obtained from the `org` query parameter and stored in localStorage.

## Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Dependencies
npm run latest          # Interactive dependency updates
```

## Styling & UI

### CSS Architecture
- **Main CSS**: `src/styles/app.css` (imports all stylesheets)
- **Tailwind**: Base configuration with custom utilities
- **DaisyUI**: Component library with theme support
- **Custom Styles**: `/styles/custom/` for overrides

### Theme System
- **Dynamic Themes**: Via `data-theme` attribute on `<html>`
- **Sidebar Themes**: Separate light/dark sidebar theming
- **System Preference**: Automatic detection and application

### Component Patterns
- **Page Structure**: `<PageTitle>` + content wrapper
- **Loading States**: `<LoadingSpinner>` with multiple variants
- **Icons**: Iconify with Lucide icon set
- **Forms**: DaisyUI components with validation

## Common Patterns & Best Practices

### State Management Best Practices
```typescript
// ✅ CORRECT: Use individual selectors
const token = useAuthStore((state) => state.token);
const login = useAuthStore((state) => state.login);

// ❌ INCORRECT: Object destructuring causes infinite loops
const { token, login } = useAuthStore((state) => ({
  token: state.token,
  login: state.login,
}));
```

### Hydration Handling
- Use `useHydration()` hook for SSR-safe components
- Use `useAuthHydration()` for auth-dependent logic
- Show loading states during hydration

### Route Protection
- Admin routes use `(admin)` route group with `<ProtectedRoute>`
- Middleware handles server-side protection
- Client-side guards for additional security

## Development Notes

### Current State
- **Production Ready**: Core daypass functionality complete
- **Active Development**: This is described as "en proceso de construcción"
- **Legacy Integration**: Supports legacy system permisos structure
- **Mobile Responsive**: Full responsive design with DaisyUI

### Architecture Decisions
1. **App Router**: Using Next.js 13+ app directory structure
2. **TypeScript Strict**: Full type safety enabled
3. **ESM**: Modern ES modules configuration
4. **Zustand**: Lightweight state management over Redux
5. **Axios Interceptors**: Centralized request/response handling

### Key Considerations
- **Build Configuration**: ESLint and TypeScript errors ignored for deployment
- **Token Management**: Stored in localStorage with automatic cleanup
- **Multi-language**: Comments in Spanish, UI likely Spanish-focused
- **School Context**: Everything scoped to `school_id` parameter

### Performance Optimizations
- **Dynamic Imports**: Components loaded as needed
- **Proper Memoization**: Avoiding unnecessary re-renders
- **Efficient Selectors**: Individual Zustand selectors
- **Image Optimization**: Next.js image handling

## Quick Start for Development

1. **Setup Environment**:
   ```bash
   cp .env.example .env.local  # Configure API URLs
   npm install
   npm run dev
   ```

2. **Key Entry Points**:
   - Development: `http://localhost:3000`
   - Login: `/auth/login`
   - Main App: `/home` (redirects from `/`)
   - Daypass: `/apps/daypass`

3. **Common Tasks**:
   - Add new pages: Create in appropriate `app/` subdirectory
   - New API endpoint: Add to relevant service file
   - UI components: Add to `components/` with TypeScript
   - State management: Extend existing stores or create new ones

4. **Testing Authentication**:
   - Use credentials from environment or test data
   - Check browser localStorage for `auth-storage` key
   - Verify token in API requests via Network tab

This documentation provides the essential context for understanding and contributing to the Interschool Next.js application efficiently.