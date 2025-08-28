"use client";

import { useState } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface AuthorizationConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    studentName?: string;
    optionDescription?: string;
    loading?: boolean;
}

const AuthorizationConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar Autorización",
    message = "¿Estás seguro de que deseas autorizar esta solicitud?",
    studentName,
    optionDescription,
    loading = false
}: AuthorizationConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-200"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)'
            }}
        >
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold text-base-content">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                        disabled={loading}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center">
                        <p className="text-base-content/80 mb-4">
                            {message}
                        </p>
                        {studentName && (
                            <div className="bg-base-200 rounded-lg p-3 mb-4">
                                <p className="text-sm font-medium text-base-content">
                                    Estudiante: {studentName}
                                </p>
                            </div>
                        )}
                        {optionDescription && (
                            <div className="bg-primary/10 rounded-lg p-3 mb-4">
                                <p className="text-sm font-medium text-primary">
                                    Opción: {optionDescription}
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-base-content/60">
                            Esta acción registrará tu autorización en el sistema.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-base-300">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="btn btn-primary gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <CheckCircleIcon className="w-5 h-5" />
                        )}
                        Autorizar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthorizationConfirmationModal;
