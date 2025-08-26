import React from 'react';
import { User, Clock, FileText, CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentPhase: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentPhase }) => {
  const phases = [
    { id: 'phase1', label: 'Registro Inicial', icon: User },
    { id: 'phase2', label: 'Revisión Admin', icon: Clock },
    { id: 'phase3', label: 'Formulario Completo', icon: FileText },
    { id: 'phase4', label: 'Revisión Final', icon: CheckCircle },
  ];

  const getPhaseStatus = (phaseId: string) => {
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    const currentIndex = phases.findIndex(p => p.id === currentPhase);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const Icon = phase.icon;
          
          return (
            <div key={phase.id} className="flex items-center">
              <div className={`flex flex-col items-center ${index > 0 ? 'ml-8' : ''}`}>
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2
                  ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${status === 'current' ? 'bg-blue-500 border-blue-500 text-white' : ''}
                  ${status === 'pending' ? 'bg-gray-200 border-gray-300 text-gray-500' : ''}
                `}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm mt-2 font-medium ${
                  status === 'completed' ? 'text-green-600' : 
                  status === 'current' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {phase.label}
                </span>
              </div>
              {index < phases.length - 1 && (
                <div className={`w-16 h-0.5 ml-4 ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
