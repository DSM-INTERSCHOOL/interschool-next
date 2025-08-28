import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
    title: "Home - Interschool",
};

export default function HomePage() {
    return (
        <>
            <PageTitle
                title="Bienvenido a Interschool"
                items={[{ label: "Home", active: true }]}
            />
            <div className="mt-6">
                <div className="hero min-h-[600px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-box">
                    <div className="hero-content text-center">
                        <div className="max-w-2xl">
                            <div className="mb-8">
                                <span className="iconify lucide--school size-32 text-primary"></span>
                            </div>
                            <h1 className="text-5xl font-bold text-base-content mb-6">
                                Nueva Interfaz del Sistema Interschool
                            </h1>
                            <p className="text-xl text-base-content/70 mb-8 leading-relaxed">
                                Estamos desarrollando una nueva experiencia de usuario más moderna, 
                                intuitiva y eficiente para la gestión escolar. Esta plataforma 
                                reemplazará la interfaz anterior con mejoras significativas en 
                                funcionalidad y diseño.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="card bg-base-100 shadow-lg">
                                    <div className="card-body text-center">
                                        <span className="iconify lucide--zap size-8 text-warning mx-auto mb-3"></span>
                                        <h3 className="card-title justify-center">Más Rápida</h3>
                                        <p className="text-sm text-base-content/70">
                                            Interfaz optimizada para mayor velocidad y eficiencia
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="card bg-base-100 shadow-lg">
                                    <div className="card-body text-center">
                                        <span className="iconify lucide--smartphone size-8 text-info mx-auto mb-3"></span>
                                        <h3 className="card-title justify-center">Responsive</h3>
                                        <p className="text-sm text-base-content/70">
                                            Diseño adaptable para todos los dispositivos
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="card bg-base-100 shadow-lg">
                                    <div className="card-body text-center">
                                        <span className="iconify lucide--shield-check size-8 text-success mx-auto mb-3"></span>
                                        <h3 className="card-title justify-center">Más Segura</h3>
                                        <p className="text-sm text-base-content/70">
                                            Mejoras en seguridad y autenticación
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="alert alert-info shadow-lg max-w-lg mx-auto">
                                <span className="iconify lucide--construction size-6"></span>
                                <div>
                                    <h3 className="font-bold">En Proceso de Construcción</h3>
                                    <div className="text-sm">
                                        Esta nueva interfaz está siendo desarrollada activamente. 
                                        Algunas funcionalidades pueden estar en desarrollo.
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <div className="badge badge-primary gap-2">
                                    <span className="iconify lucide--clock size-3"></span>
                                    Próximamente
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
