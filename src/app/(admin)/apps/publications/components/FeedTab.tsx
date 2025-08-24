"use client";

import { RssIcon } from "@heroicons/react/24/outline";

const FeedTab = () => {
    return (
        <div className="text-center py-12">
            <RssIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">
                Feed de Publicaciones
            </h3>
            <p className="text-base-content/70 mb-4">
                Aquí se mostrarán todas las publicaciones y actualizaciones de la escuela
            </p>
            <div className="bg-base-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-sm text-base-content/70">
                    Esta funcionalidad estará disponible próximamente. 
                    Incluirá un feed en tiempo real con todas las publicaciones, 
                    avisos, eventos y actualizaciones de la comunidad escolar.
                </p>
            </div>
        </div>
    );
};

export default FeedTab;

