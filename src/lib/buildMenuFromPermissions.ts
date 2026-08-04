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
  Legacy?: number;
};

export function buildSidebarMenuFromPermisos(permisos: Permiso[]): ISidebarMenuItem[] {
  const modulosMap = new Map<string, ISidebarMenuItem>();

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
    const isLegacy = permiso.Legacy === 1;
    const legacyUrl = permiso.Accion.startsWith('https://')
      ? permiso.Accion
      : `/${permiso.Contexto}/${permiso.Namespace}/${permiso.Accion}`;

    grupo.children!.push({
      id: permisoId,
      label: permiso.Etiqueta,
      url: isLegacy ? `/legacy` : permiso.Accion,
      legacyUrl: isLegacy ? legacyUrl : undefined,
      isLegacy,
    });
  }
  const menuItems: ISidebarMenuItem[] = [
    // 👇 Sección "Menu" como título antes de todo
    {
      id: "Menu-label",
      isTitle: true,
      label: "Menu",
    },
    // 👇 Módulos dinámicos
    ...Array.from(modulosMap.values()),
  ];
  return menuItems;
}
