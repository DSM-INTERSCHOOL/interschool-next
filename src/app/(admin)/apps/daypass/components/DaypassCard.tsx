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

  console.log({daypass})

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

  const formatAcademicInfo = (info: any) => {
    if (!info) return "N/A";
    return `(${info.key}) ${info.description}`;
  };

  // Obtener la configuración de secuencia del primer elemento
  const firstAuth = authorizations[0];
  const sequenceConfig = firstAuth.daypass_config.authorization_sequence;
  const currentSequence = firstAuth.authorization_sequence;

  // Obtener todas las secuencias disponibles
  const sequenceKeys = Object.keys(sequenceConfig).map(key => parseInt(key)).sort((a, b) => a - b);

  // Filtrar solo la secuencia que corresponde al authorization_sequence del usuario actual
  const mySequences = sequenceKeys.filter(sequenceNum => {
    return sequenceNum === currentSequence;
  });

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

              {/* Academic Information */}
              <div className="mt-3 space-y-1 text-sm text-base-content/70">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Ciclo:</span> {formatAcademicInfo(firstAuth.academic_year)}
                  </div>
                  <div>
                    <span className="font-semibold">Nivel:</span> {formatAcademicInfo(firstAuth.academic_stage)}
                  </div>
                  <div>
                    <span className="font-semibold">Programa:</span> {formatAcademicInfo(firstAuth.academic_program)}
                  </div>
                  <div>
                    <span className="font-semibold">Grado:</span> {formatAcademicInfo(firstAuth.program_year)}
                  </div>
                  <div>
                    <span className="font-semibold">Grupo:</span> {formatAcademicInfo(firstAuth.academic_group)}
                  </div>
                </div>
              </div>
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
          
          {mySequences.length > 0 && (
            <div className="mb-4">
              {mySequences.map((sequenceNum) => {
                const step = sequenceConfig[sequenceNum.toString()];
                const isCurrentStep = sequenceNum === currentSequence;
                
                return isCurrentStep ? (
                  <div key={sequenceNum} className="space-y-2">
                    <AuthorizationOptions
                      options={step.options}
                      onSelectOption={handleOptionSelect}
                      disabled={authorizing}
                      selectedOption={selectedOption}
                      groupName={`daypass-${daypass.id}-sequence-${sequenceNum}`}
                    />
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      <AuthorizationConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAuthorization}
        title="Confirmar Autorización"
        message="¿Estás seguro de que deseas autorizar esta solicitud?"
        studentName={formatFullName(daypass.person)}
        optionDescription={getSelectedOptionDescription()}
        loading={authorizing}
      />
    </>
  );
};

export default DaypassCard;
