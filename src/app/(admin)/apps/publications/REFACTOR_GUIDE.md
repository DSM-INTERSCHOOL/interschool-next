# Guía de Refactorización - PublicationsApp

## ✅ Hooks Creados

### 1. `useAcademicData`
**Ubicación**: `hooks/useAcademicData.ts`

**Responsabilidad**: Gestión de datos académicos (años, niveles, programas, grupos)

**API**:
```typescript
const {
  academicYears,
  academicStages,
  academicPrograms,
  programYears,
  academicGroups,
  loading,
  error,
  loadAcademicPrograms,
  loadProgramYears,
  loadAcademicGroups
} = useAcademicData();
```

### 2. `useRecipients`
**Ubicación**: `hooks/useRecipients.ts`

**Responsabilidad**: Carga y gestión de destinatarios

**API**:
```typescript
const {
  recipients,
  loading,
  error,
  loadRecipients,
  clearRecipients
} = useRecipients();
```

### 3. `usePublicationForm`
**Ubicación**: `hooks/usePublicationForm.ts`

**Responsabilidad**: Estado del formulario y lógica de publicación/actualización

**API**:
```typescript
const {
  formData,
  updateFormField,
  attachments,
  existingAttachments,
  addAttachment,
  removeAttachment,
  removeExistingAttachment,
  handleFileUpload,
  handlePublish,
  loadedAnnouncement,
  loading,
  publishLoading,
  error,
  publishError
} = usePublicationForm(announcementId, publicationType);
```

### 4. `useSelections`
**Ubicación**: `hooks/useSelections.ts`

**Responsabilidad**: Estado de selecciones múltiples (checkboxes)

**API**:
```typescript
const {
  // State
  selectedAcademicYears,
  selectedAcademicStages,
  selectedRecipientTypes,
  selectedRecipients,
  // ... más estados

  // Handlers
  handleAcademicYearToggle,
  handleSelectAllAcademicYears,
  // ... más handlers

  // Utils
  preloadSelections
} = useSelections();
```

## 📦 Componentes a Extraer

### Componentes de UI Básicos

#### `PublicationTypeSelector.tsx`
Selector de tipo de publicación (Aviso vs Tarea)
- **Props**: `publicationType`, `onChange`, `disabled`
- **Líneas originales**: 718-789

#### `RecipientTypeSelector.tsx`
Selector de tipos de destinatarios
- **Props**: `selectedTypes`, `onToggle`, `onSelectAll`
- **Líneas originales**: 792-861

#### `AcademicYearSelector.tsx`
Selector de años académicos con checkboxes
- **Props**: `academicYears`, `selected`, `onToggle`, `onSelectAll`, `loading`, `error`
- **Líneas originales**: 876-960

#### `AcademicStageSelector.tsx`
Similar a AcademicYearSelector para niveles
- **Props**: Similar a AcademicYearSelector
- **Líneas originales**: 966-1050

### Componentes de Tabla

#### `RecipientTable.tsx`
Tabla de destinatarios con selección
- **Props**: `recipients`, `selected`, `onToggle`, `onSelectAll`
- **Líneas originales**: 1354-1465

### Componentes de Formulario

#### `PublicationFormFields.tsx`
Campos principales del formulario (título, contenido, fechas)
- **Props**: `formData`, `onChange`, `publicationType`, `onFileUpload`
- **Líneas originales**: 1503-1707

#### `AssignmentFields.tsx`
Campos específicos para tareas
- **Props**: `subjectId`, `subjectName`, `dueDate`, `onChange`
- **Líneas originales**: 1527-1582

#### `AttachmentsManager.tsx`
Gestor de archivos adjuntos
- **Props**: `attachments`, `existingAttachments`, `onAdd`, `onRemove`, `onRemoveExisting`
- **Líneas originales**: 1709-1830

#### `PublicationSettings.tsx`
Configuración adicional (comentarios, autorización)
- **Props**: `acceptComments`, `authorized`, `onChange`, `publicationType`
- **Líneas originales**: 1833-1879

## 🔄 Estructura del Componente Refactorizado

```typescript
const PublicationsApp = ({ announcementId, type }: PublicationsAppProps) => {
    const [publicationType, setPublicationType] = useState(type || 'announcement');

    // Custom hooks
    const academicData = useAcademicData();
    const selections = useSelections();
    const recipientsData = useRecipients();
    const publicationForm = usePublicationForm(announcementId, publicationType);

    // Effects para cargar datos dependientes
    useEffect(() => {
        academicData.loadAcademicPrograms(selections.selectedAcademicStages);
    }, [selections.selectedAcademicStages]);

    useEffect(() => {
        academicData.loadProgramYears(
            selections.selectedAcademicStages,
            selections.selectedAcademicPrograms
        );
    }, [selections.selectedAcademicStages, selections.selectedAcademicPrograms]);

    // ... más effects

    // Effect para resetear recipients cuando cambian filtros
    useEffect(() => {
        recipientsData.clearRecipients();
    }, [
        selections.selectedRecipientTypes,
        selections.selectedAcademicYears,
        // ... más dependencias
    ]);

    // Effect para precargar selecciones en modo edición
    useEffect(() => {
        if (publicationForm.loadedAnnouncement && academicData.academicYears.length > 0) {
            selections.preloadSelections(
                publicationForm.loadedAnnouncement,
                academicData.academicYears
            );
        }
    }, [publicationForm.loadedAnnouncement, academicData.academicYears]);

    const handleLoadRecipients = () => {
        recipientsData.loadRecipients(
            selections.selectedRecipientTypes,
            {
                academic_years: Array.from(selections.selectedAcademicYears),
                academic_stages: Array.from(selections.selectedAcademicStages),
                academic_programs: Array.from(selections.selectedAcademicPrograms),
                program_years: Array.from(selections.selectedProgramYears),
                academic_groups: Array.from(selections.selectedAcademicGroups),
            }
        );
    };

    const handlePublish = () => {
        publicationForm.handlePublish(
            selections.selectedRecipients,
            {
                academicYears: selections.selectedAcademicYears,
                academicStages: selections.selectedAcademicStages,
                academicPrograms: selections.selectedAcademicPrograms,
                programYears: selections.selectedProgramYears,
                academicGroups: selections.selectedAcademicGroups,
            }
        );
    };

    return (
        <div className="bg-base-100 rounded-lg shadow-sm">
            <PageHeader />

            <div className="p-6">
                <div className="space-y-6">
                    {!announcementId && (
                        <PublicationTypeSelector
                            value={publicationType}
                            onChange={setPublicationType}
                        />
                    )}

                    {!announcementId && (
                        <RecipientTypeSelector
                            selected={selections.selectedRecipientTypes}
                            onToggle={selections.handleRecipientTypeToggle}
                            onSelectAll={selections.handleSelectAllRecipientTypes}
                        />
                    )}

                    {announcementId && publicationForm.loadedAnnouncement && (
                        <DestinatariosInfo
                            announcement={publicationForm.loadedAnnouncement}
                            {...academicData}
                        />
                    )}

                    {!announcementId && shouldShowAcademicYears(selections.selectedRecipientTypes) && (
                        <AcademicYearSelector
                            academicYears={academicData.academicYears}
                            selected={selections.selectedAcademicYears}
                            onToggle={selections.handleAcademicYearToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllAcademicYears(
                                    academicData.academicYears.map(y => y.id),
                                    isSelected
                                )
                            }
                            loading={academicData.loading}
                            error={academicData.error}
                        />
                    )}

                    {/* Similar para otros selectores académicos */}

                    {selections.selectedRecipientTypes.size > 0 && (
                        <RecipientsSection
                            recipients={recipientsData.recipients}
                            selected={selections.selectedRecipients}
                            loading={recipientsData.loading}
                            error={recipientsData.error}
                            onToggle={selections.handleRecipientToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllRecipients(
                                    recipientsData.recipients.map(r => r.person_id),
                                    isSelected
                                )
                            }
                            onLoadRecipients={handleLoadRecipients}
                        />
                    )}

                    {shouldShowForm(selections) && (
                        <PublicationFormCard
                            announcementId={announcementId}
                            publicationType={publicationType}
                            formData={publicationForm.formData}
                            onFieldChange={publicationForm.updateFormField}
                            attachments={publicationForm.attachments}
                            existingAttachments={publicationForm.existingAttachments}
                            onAddAttachment={publicationForm.addAttachment}
                            onRemoveAttachment={publicationForm.removeAttachment}
                            onRemoveExistingAttachment={publicationForm.removeExistingAttachment}
                            onFileUpload={publicationForm.handleFileUpload}
                            onPublish={handlePublish}
                            publishLoading={publicationForm.publishLoading}
                            publishError={publicationForm.publishError}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
```

## 🎯 Beneficios del Refactor

### 1. **Separación de Responsabilidades**
- Cada hook tiene una responsabilidad clara
- Los componentes son más pequeños y enfocados
- Fácil de mantener y testear

### 2. **Reutilización**
- Hooks pueden usarse en otros componentes
- Componentes UI son reutilizables
- Lógica desacoplada de la presentación

### 3. **Mejor Performance**
- useCallback y useMemo en los hooks
- Componentes más pequeños se re-renderizan menos
- Selectores optimizados

### 4. **Testabilidad**
- Hooks pueden testearse independientemente
- Componentes más simples de testear
- Mocks más fáciles de crear

### 5. **Mantenibilidad**
- Código más legible (componentes < 200 líneas)
- Fácil localizar bugs
- Cambios más seguros

## 📝 Próximos Pasos

1. ✅ Crear hooks básicos (completado)
2. ⏳ Crear componentes de selección
3. ⏳ Crear componentes de formulario
4. ⏳ Refactorizar componente principal
5. ⏳ Agregar tests unitarios
6. ⏳ Optimizar re-renders con memo

## 🔧 Uso Recomendado

Para completar el refactor:

1. **Crear componentes uno por uno** siguiendo los ejemplos
2. **Probar cada componente** antes de integrarlo
3. **Migrar gradualmente** el componente principal
4. **Mantener ambas versiones** hasta validar todo funcione
5. **Eliminar código viejo** una vez probado el refactor
