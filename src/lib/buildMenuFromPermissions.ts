// lib/buildSidebarMenuFromPermisos.ts

import { ISidebarMenuItem } from "@/app/(admin)/(layout)/components/SidebarMenuItem";

type Permiso = {
  IdPermiso: number;
  NombreModulo: string;
  GrupoMenu: string;
  Etiqueta: string;
  Accion: string;
  Namespace: string;
  Contexto: string;
  Discriminator: string;
  OrdenMenu?: number;
};

export function buildSidebarMenuFromPermisos(permisos: Permiso[]): ISidebarMenuItem[] {
  const modulosMap = new Map<string, ISidebarMenuItem>();
  console.log({permisos})

  for (const permiso of permisos.filter(p => p.Discriminator === "Menu")) {
    const moduloId = permiso.NombreModulo.toUpperCase();
    const grupoId = permiso.GrupoMenu.toUpperCase();
    const permisoId = `permiso-${permiso.IdPermiso}`;

    // Nivel 1: NombreModulo como folder principal
    if (!modulosMap.has(moduloId)) {
      modulosMap.set(moduloId, {
        id: `modulo-${moduloId}`,
        label: moduloId,
        icon: "lucide--folder",
        children: [],
      });
    }

    const modulo = modulosMap.get(moduloId)!;

    // Nivel 2: GrupoMenu
    let grupo = modulo.children?.find(g => g.label === grupoId);
    if (!grupo) {
      grupo = {
        id: `grupo-${moduloId}-${grupoId}`,
        label: grupoId,
        icon: "lucide--list",
        children: [],
      };
      modulo.children!.push(grupo);
    }

    // Nivel 3: Opción de menú (permiso)
    grupo.children!.push({
      id: permisoId,
      label: permiso.Etiqueta,
      url: `/legacy`,
      legacyUrl: permiso.Accion.startsWith('https://')? permiso.Accion : `/${permiso.Contexto}/${permiso.Namespace}/${permiso.Accion}`,
    });
  }
  const menuItems: ISidebarMenuItem[] = [
    // 👇 Sección "Apps" como título antes de todo
    {
      id: "Legacy-label",
      isTitle: true,
      label: "Legacy",
    },
    // 👇 Módulos dinámicos
    ...Array.from(modulosMap.values()),
  ];
  return menuItems;
}
