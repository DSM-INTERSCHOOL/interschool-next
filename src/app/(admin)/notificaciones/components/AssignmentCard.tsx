"use client";

interface Assignment {
    id: number;
    title: string;
    description: string;
    subject: string;
    dueDate: string;
    teacher: string;
    status?: "pending" | "submitted" | "graded";
}

interface AssignmentCardProps {
    assignment: Assignment;
}

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "submitted":
                return <span className="badge badge-info badge-sm">Entregada</span>;
            case "graded":
                return <span className="badge badge-success badge-sm">Calificada</span>;
            default:
                return <span className="badge badge-warning badge-sm">Pendiente</span>;
        }
    };

    const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === "pending";

    return (
        <div className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow ${isOverdue ? "border-l-4 border-error" : ""}`}>
            <div className="card-body">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h3 className="card-title text-lg">{assignment.title}</h3>
                        <div className="badge badge-outline badge-sm mt-1">{assignment.subject}</div>
                    </div>
                    {getStatusBadge(assignment.status)}
                </div>

                <p className="text-base-content/80 text-sm mt-2">{assignment.description}</p>

                <div className="divider my-2"></div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base-content/60 text-xs">
                        <span className="iconify lucide--user size-3" />
                        <span>{assignment.teacher}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isOverdue ? "text-error font-semibold" : "text-base-content/60"}`}>
                        <span className="iconify lucide--calendar-clock size-3" />
                        <span>Vence: {new Date(assignment.dueDate).toLocaleDateString("es-MX")}</span>
                        {isOverdue && <span className="badge badge-error badge-xs">Atrasada</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
