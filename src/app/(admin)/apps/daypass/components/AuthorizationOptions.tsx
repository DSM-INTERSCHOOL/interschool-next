"use client";

import { IAuthorizationOption } from "@/interfaces/IDaypass";

interface AuthorizationOptionsProps {
  options: Record<string, IAuthorizationOption>;
  onSelectOption: (optionKey: string) => void;
  disabled?: boolean;
  selectedOption?: string | null;
  groupName?: string;
}

const AuthorizationOptions = ({ 
  options, 
  onSelectOption, 
  disabled = false,
  selectedOption = null,
  groupName = "authorization-option"
}: AuthorizationOptionsProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-base-content/80 mb-2">
        Selecciona una opción de autorización:
      </p>
      <div className="space-y-2">
        {Object.entries(options).map(([optionKey, option]) => {
          const isSelected = selectedOption === optionKey;
          
          return (
            <label
              key={optionKey}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-base-200 hover:bg-base-300 border border-base-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={groupName}
                value={optionKey}
                checked={isSelected}
                onChange={() => !disabled && onSelectOption(optionKey)}
                disabled={disabled}
                className="radio radio-primary"
              />
              <div className="text-left flex-1">
                <div className="font-medium">{option.description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AuthorizationOptions;
