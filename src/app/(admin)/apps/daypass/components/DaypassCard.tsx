import { 
    ClockIcon, 
    UserIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { IDaypass } from "@/interfaces/IDaypass";

interface DaypassCardProps {
    daypass: IDaypass;
    onAuthorize: (daypassId: string, authorizerPersonId: string) => void;
    authorizing: boolean;
    selectedAuthorizerId: string | null;
    onAuthorizerSelect: (authorizerId: string) => void;
}

const DaypassCard = ({ daypass, onAuthorize, authorizing, selectedAuthorizerId, onAuthorizerSelect }: DaypassCardProps) => {
    const formatFullName = (person: { given_name: string; paternal_name: string; maternal_name: string }) => {
        return `${person.given_name} ${person.paternal_name} ${person.maternal_name}`.trim();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDIENTE':
                return <ExclamationTriangleIcon className="w-5 h-5 text-warning" />;
            case 'AUTORIZADO':
                return <CheckCircleIcon className="w-5 h-5 text-success" />;
            case 'RECHAZADO':
                return <XCircleIcon className="w-5 h-5 text-error" />;
            default:
                return <ClockIcon className="w-5 h-5 text-base-content/70" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDIENTE':
                return 'badge-warning';
            case 'AUTORIZADO':
                return 'badge-success';
            case 'RECHAZADO':
                return 'badge-error';
            default:
                return 'badge-base-content';
        }
    };

    return (
        <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(daypass.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(daypass.daypass_date)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                <ClockIcon className="w-4 h-4" />
                                {formatTime(daypass.daypass_time)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 className="font-semibold text-base-content mb-2">Alumno</h4>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-primary" />
                                    <span className="font-medium">
                                        {formatFullName(daypass.person)}
                                    </span>
                                </div>
                                <p className="text-sm text-base-content/70 ml-6">
                                    Matrícula: {daypass.person.person_internal_id}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-base-content mb-2">Solicitante</h4>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-secondary" />
                                    <span className="font-medium">
                                        {formatFullName(daypass.relative)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-semibold text-base-content mb-2">Motivo</h4>
                            <p className="text-base-content/90 bg-base-100 p-3 rounded-lg">
                                {daypass.reason}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-base-content mb-2">Autorizadores</h4>
                                                         <div className="space-y-2">
                                 {daypass.authorizers.map((authorizer) => {
                                     const authorizerId = authorizer.authorizer_person_id.toString();
                                     const isSelected = selectedAuthorizerId === authorizerId;
                                     const isAuthorized = authorizer.authorized;
                                     
                                     return (
                                         <div 
                                             key={authorizer.authorizer_person_id} 
                                             className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                                 isSelected 
                                                     ? 'bg-primary text-primary-content' 
                                                     : isAuthorized 
                                                         ? 'bg-success/10 border border-success/20' 
                                                         : 'bg-base-100 hover:bg-base-200'
                                             }`}
                                             onClick={() => !isAuthorized && onAuthorizerSelect(authorizerId)}
                                         >
                                             <div>
                                                 <span className="font-medium">
                                                     {formatFullName(authorizer.authorizer)}
                                                 </span>
                                                 <p className={`text-sm ${isSelected ? 'text-primary-content/70' : 'text-base-content/70'}`}>
                                                     {authorizer.authorizer.email}
                                                 </p>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 {isAuthorized ? (
                                                     <span className="badge badge-success gap-1">
                                                         <CheckCircleIcon className="w-3 h-3" />
                                                         Autorizado
                                                     </span>
                                                 ) : isSelected ? (
                                                     <span className="badge badge-primary gap-1">
                                                         <CheckCircleIcon className="w-3 h-3" />
                                                         Seleccionado
                                                     </span>
                                                                                                   ) : (
                                                      <span className="badge badge-outline gap-1">
                                                          <ClockIcon className="w-3 h-3" />
                                                          Seleccionar
                                                      </span>
                                                  )}
                                             </div>
                                         </div>
                                     );
                                 })}
                             </div>
                        </div>
                    </div>

                                         <div className="ml-6">
                         <button
                             onClick={() => selectedAuthorizerId && onAuthorize(daypass.id.toString(), selectedAuthorizerId)}
                             disabled={authorizing || !selectedAuthorizerId}
                             className="btn btn-primary btn-sm"
                         >
                            {authorizing ? (
                                <>
                                    <div className="loading loading-spinner loading-xs"></div>
                                    Autorizando...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Autorizar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DaypassCard;
