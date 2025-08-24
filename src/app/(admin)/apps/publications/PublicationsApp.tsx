"use client";

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { 
    RssIcon, 
    MegaphoneIcon, 
    CalendarIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import FeedTab from "./components/FeedTab";
import AnnouncementsTab from "./components/AnnouncementsTab";
import EventsTab from "./components/EventsTab";
import DocumentsTab from "./components/DocumentsTab";

const PublicationsApp = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const searchParams = useSearchParams();

    // Leer el parámetro tab de la URL y seleccionar la pestaña correspondiente
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam !== null) {
            const tabIndex = parseInt(tabParam);
            if (tabIndex >= 0 && tabIndex < 4) {
                setSelectedTab(tabIndex);
            }
        }
    }, [searchParams]);

    const tabs = [
        {
            name: "Feed",
            icon: RssIcon,
            component: FeedTab,
            description: "Publicaciones y actualizaciones"
        },
        {
            name: "Avisos",
            icon: MegaphoneIcon,
            component: AnnouncementsTab,
            description: "Anuncios y comunicaciones"
        },
        {
            name: "Eventos",
            icon: CalendarIcon,
            component: EventsTab,
            description: "Eventos y actividades"
        },
        {
            name: "Documentos",
            icon: DocumentTextIcon,
            component: DocumentsTab,
            description: "Documentos y archivos"
        }
    ];

    return (
        <div className="bg-base-100 rounded-lg shadow-sm">
            <div className="p-6 border-b border-base-300">
                <h2 className="text-2xl font-bold text-base-content">
                    Centro de Publicaciones
                </h2>
                <p className="text-base-content/70 mt-2">
                    Gestiona todas las publicaciones, avisos y comunicaciones de la escuela
                </p>
            </div>

            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1 bg-base-200 p-1 rounded-lg m-6">
                    {tabs.map((tab, index) => (
                        <Tab
                            key={tab.name}
                            className={({ selected }) =>
                                `w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                                    selected
                                        ? 'bg-primary text-primary-content shadow-sm'
                                        : 'text-base-content/70 hover:text-base-content hover:bg-base-100'
                                }`
                            }
                        >
                            <tab.icon className="w-5 h-5 mr-2" />
                            {tab.name}
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels className="px-6 pb-6">
                    {tabs.map((tab, index) => (
                        <Tab.Panel key={index}>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-base-content">
                                            {tab.name}
                                        </h3>
                                        <p className="text-sm text-base-content/70">
                                            {tab.description}
                                        </p>
                                    </div>
                                </div>
                                <tab.component />
                            </div>
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default PublicationsApp;
