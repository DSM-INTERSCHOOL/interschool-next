"use client";

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, CalendarIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import { IDaypass, IDaypassAuthorizer } from "@/interfaces/IDaypass";
import AuthorizationOptions from "./AuthorizationOptions";
import AuthorizationConfirmationModal from "@/components/AuthorizationConfirmationModal";
import { useAuthStore } from "@/store/useAuthStore";

interface DaypassCardProps {
  daypass: IDaypass;
  authorizations: IDaypassAuthorizer[];
  onAuthorize: (daypassId: string, authorizerPersonId: string, selectedOption: string) => void;
  authorizing: boolean;
  selectedAuthorizerId: string | null;
  onAuthorizerSelect: (authorizerId: string) => void;
}

const DaypassCard = ({ 
  daypass, 
  authorizations, 
  onAuthorize, 
  authorizing, 
  selectedAuthorizerId, 
  onAuthorizerSelect 
}: DaypassCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const personId = useAuthStore((state) => state.personId);

  const formatFullName = (person: any) => {
    return `${person.given_name} ${person.paternal_name}${person.maternal_name ? ` ${person.maternal_name}` : ''}`.trim();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Extraer solo HH:MM
  };

  // Obtener la configuración de secuencia del primer elemento
  const firstAuth = authorizations[0];
  const sequenceConfig = firstAuth.daypass_config.authorization_sequence;
  const currentSequence = firstAuth.authorization_sequence;

  // Obtener todas las secuencias disponibles
  const sequenceKeys = Object.keys(sequenceConfig).map(key => parseInt(key)).sort((a, b) => a - b);

  // Obtener el paso actual
  const currentStep = sequenceConfig[currentSequence.toString()];

  const handleOptionSelect = (optionKey: string) => {
    setSelectedOption(optionKey);
  };

  const handleAuthorizeClick = () => {
    if (selectedOption) {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmAuthorization = () => {
    if (selectedOption && personId) {
      // Usar el personId de la persona logueada
      onAuthorize(daypass.id.toString(), personId.toString(), selectedOption);
      setSelectedOption(null);
      setShowConfirmationModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
  };

  // Obtener la descripción de la opción seleccionada
  const getSelectedOptionDescription = () => {
    if (selectedOption && currentStep) {
      return currentStep.options[selectedOption]?.description;
    }
    return undefined;
  };

  return (
    <>
      <div className="bg-base-100 card card-border">
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-base-content">
                  {formatFullName(daypass.person)}
                </h3>
                <span className="badge badge-outline badge-sm">
                  {daypass.person.person_internal_id}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4 text-secondary" />
                <span className="text-base-content/70">
                  Solicitante: {formatFullName(daypass.relative)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-secondary" />
                <span className="text-base-content/70">
                  {formatDate(daypass.daypass_date)} a las {formatTime(daypass.daypass_time)}
                </span>
              </div>

              <p className="text-base-content/80 mb-2">
                <strong>Motivo:</strong> {daypass.reason}
              </p>
            </div>

            <div className="flex-shrink-0 ml-4">
              <button
                onClick={handleAuthorizeClick}
                disabled={authorizing || !selectedOption}
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

          <div className="divider"></div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-base-content mb-3">Secuencia de Autorización</h4>
            <div className="space-y-3">
              {sequenceKeys.map((sequenceNum) => {
                const step = sequenceConfig[sequenceNum.toString()];
                const isCurrentStep = sequenceNum === currentSequence;
                const isCompleted = sequenceNum < currentSequence;
                const isPending = sequenceNum > currentSequence;
                
                return (
                  <div
                    key={sequenceNum}
                    className={`p-3 rounded-lg border ${
                      isCurrentStep
                        ? 'border-primary bg-primary/5'
                        : isCompleted
                          ? 'border-success bg-success/5'
                          : 'border-base-300 bg-base-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          isCurrentStep ? 'badge-primary' :
                          isCompleted ? 'badge-success' : 'badge-outline'
                        }`}>
                          Paso {sequenceNum + 1}
                        </span>
                        <span className="font-medium">{step.description}</span>
                      </div>
                      {isCompleted && <CheckCircleIcon className="w-5 h-5 text-success" />}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-base-content/70">
                        Autorizador ID: {step.person_authorizer_id}
                      </span>
                    </div>
                    
                    {isCurrentStep && (
                      <div className="space-y-2">
                        <AuthorizationOptions
                          options={step.options}
                          onSelectOption={handleOptionSelect}
                          disabled={authorizing}
                          selectedOption={selectedOption}
                          groupName={`daypass-${daypass.id}-sequence-${sequenceNum}`}
                        />
                      </div>
                    )}
                    
                    {isPending && (
                      <p className="text-sm text-base-content/50">
                        {/* Removed "Pendiente de autorización" label */}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AuthorizationConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAuthorization}
        title="Confirmar Autorización"
        message="¿Estás seguro de que deseas autorizar este pase de salida?"
        studentName={formatFullName(daypass.person)}
        optionDescription={getSelectedOptionDescription()}
        loading={authorizing}
      />
    </>
  );
};

export default DaypassCard;
