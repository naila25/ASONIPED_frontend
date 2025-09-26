import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { RecordWithDetails } from '../Types/records';

interface RejectionInfoProps {
  record: RecordWithDetails;
  onRestart: () => void;
}

const RejectionInfo: React.FC<RejectionInfoProps> = ({ record }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitud Rechazada</h3>
        <p className="text-gray-600">Su solicitud inicial no fue aprobada.</p>
      </div>

      {/* Comentario del administrador */}
      {record.notes && record.notes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-red-900 mb-2">Motivo del Rechazo</h4>
          <div className="space-y-2">
            {record.notes
              .filter(note => note.type === 'activity' && note.note?.includes('Record rejected'))
              .map((note, index) => (
                <div key={index} className="bg-white p-3 rounded border border-red-100">
                  <p className="text-sm text-red-800">
                    {note.note?.includes('Record rejected by admin: ') 
                      ? note.note.replace('Record rejected by admin: ', '')
                      : note.note?.includes('Record rejected by admin')
                      ? 'El administrador ha rechazado su expediente.'
                      : note.note || 'Sin comentario específico'}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))}
            {record.notes.filter(note => note.type === 'activity' && note.note?.includes('Record rejected')).length === 0 && (
              <div className="bg-white p-3 rounded border border-red-100">
                <p className="text-sm text-red-800 italic">No hay comentarios específicos del administrador sobre el rechazo.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
