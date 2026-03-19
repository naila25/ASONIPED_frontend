import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { RecordWithDetails } from '../Types/records';

interface RejectionInfoProps {
  record: RecordWithDetails;
  onRestart: () => void;
}

const RejectionInfo: React.FC<RejectionInfoProps> = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitud Rechazada</h3>
        <p className="text-gray-600">Su solicitud inicial no fue aprobada.</p>
      </div>

      {/* Información sobre el reinicio */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-yellow-900 mb-2">¿Qué hacer ahora?</h4>
        <p className="text-yellow-800 text-sm">
          Puede revisar la información proporcionada y corregir los datos según las observaciones del administrador. 
          Luego podrá enviar una nueva solicitud.
        </p>
      </div>
    </div>
  );
};

export default RejectionInfo;
