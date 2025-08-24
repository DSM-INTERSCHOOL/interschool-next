"use client";

import { useState } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

// Ejemplo de uso del componente DeleteConfirmationModal
const DeleteConfirmationModalExample = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        // Simular operación de eliminación
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        setShowModal(false);
        console.log("Elemento eliminado");
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ejemplos de DeleteConfirmationModal</h2>
            
            <div className="space-y-4">
                {/* Ejemplo básico */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h3 className="card-title">Ejemplo Básico</h3>
                        <p>Modal con configuración por defecto</p>
                        <button 
                            className="btn btn-error"
                            onClick={() => setShowModal(true)}
                        >
                            Eliminar Elemento
                        </button>
                    </div>
                </div>

                {/* Ejemplo personalizado */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h3 className="card-title">Ejemplo Personalizado</h3>
                        <p>Modal con título, mensaje y nombre del elemento personalizados</p>
                        <DeleteConfirmationModal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}
                            onConfirm={handleDelete}
                            title="Eliminar Usuario"
                            message="¿Estás seguro de que deseas eliminar este usuario del sistema?"
                            itemName="Juan Pérez"
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModalExample;

