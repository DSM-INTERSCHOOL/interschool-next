"use client";

import { useState } from "react";
import { getDaypassAuthorizers, authorizeDaypass } from "@/services/daypass.service";

const TestComponent = () => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testGetDaypasses = async () => {
        setLoading(true);
        try {
            const data = await getDaypassAuthorizers({
                schoolId: "1",
                authorizerPersonId: "1",
                status: "pendiente"
            });
            setResult({ type: "get", data });
        } catch (error) {
            setResult({ type: "get", error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const testAuthorize = async () => {
        setLoading(true);
        try {
            const data = await authorizeDaypass({
                schoolId: "1",
                daypassId: "1",
                authorizerPersonId: "2616",
                dto: {
                    authorized: true,
                    authorized_at: new Date().toISOString()
                }
            });
            setResult({ type: "authorize", data });
        } catch (error) {
            setResult({ type: "authorize", error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Pruebas de Pase de Salida</h2>
            
            <div className="space-x-2">
                <button 
                    onClick={testGetDaypasses}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? "Probando..." : "Probar Obtener Pases"}
                </button>
                
                <button 
                    onClick={testAuthorize}
                    disabled={loading}
                    className="btn btn-secondary"
                >
                    {loading ? "Probando..." : "Probar Autorizar"}
                </button>
            </div>

            {result && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">
                        Resultado: {result.type}
                    </h3>
                    <pre className="bg-base-200 p-4 rounded-lg overflow-auto text-sm">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default TestComponent;
