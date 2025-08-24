"use client";

import { CalendarIcon } from "@heroicons/react/24/outline";

const EventsTab = () => {
    return (
        <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">
                Gestión de Eventos
            </h3>
            <p className="text-base-content/70 mb-4">
                Crea y gestiona eventos escolares, actividades y calendarios
            </p>
            <div className="bg-base-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-sm text-base-content/70">
                    Esta funcionalidad estará disponible próximamente. 
                    Incluirá la gestión completa de eventos escolares, 
                    calendarios, actividades extraescolares y recordatorios.
                </p>
            </div>
        </div>
    );
};

export default EventsTab;

