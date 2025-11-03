"use client";

interface Aviso {
    id: number;
    title: string;
    content: string;
    date: string;
    author: string;
    priority?: "normal" | "high" | "urgent";
}

interface AvisoCardProps {
    aviso: Aviso;
}

export const AvisoCard = ({ aviso }: AvisoCardProps) => {
    const getPriorityBadge = (priority?: string) => {
        switch (priority) {
            case "urgent":
                return <span className="badge badge-error badge-sm">Urgente</span>;
            case "high":
                return <span className="badge badge-warning badge-sm">Alta</span>;
            default:
                return <span className="badge badge-ghost badge-sm">Normal</span>;
        }
    };

    return (
        <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="card-title text-lg">{aviso.title}</h3>
                    {getPriorityBadge(aviso.priority)}
                </div>

                <p className="text-base-content/80 text-sm">{aviso.content}</p>

                <div className="card-actions items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-base-content/60 text-xs">
                        <span className="iconify lucide--user size-3" />
                        <span>{aviso.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/60 text-xs">
                        <span className="iconify lucide--calendar size-3" />
                        <span>{new Date(aviso.date).toLocaleDateString("es-MX")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
