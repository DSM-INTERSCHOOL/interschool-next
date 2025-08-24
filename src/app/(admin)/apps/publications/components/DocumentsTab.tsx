"use client";

import { DocumentTextIcon } from "@heroicons/react/24/outline";

const DocumentsTab = () => {
    return (
        <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">
                Gestión de Documentos
            </h3>
            <p className="text-base-content/70 mb-4">
                Sube, organiza y comparte documentos escolares
            </p>
            <div className="bg-base-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-sm text-base-content/70">
                    Esta funcionalidad estará disponible próximamente. 
                    Incluirá la gestión de documentos, archivos adjuntos, 
                    biblioteca digital y compartir archivos de forma segura.
                </p>
            </div>
        </div>
    );
};

export default DocumentsTab;

