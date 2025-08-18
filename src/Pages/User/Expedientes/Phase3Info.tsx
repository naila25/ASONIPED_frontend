import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { RecordWithDetails } from '../../../types/records';

interface Phase3InfoProps {
  record: RecordWithDetails;
  onContinue: () => void;
}

const Phase3Info: React.FC<Phase3InfoProps> = ({ record, onContinue }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Solicitud Aprobada!</h3>
        <p className="text-gray-600">Su solicitud inicial ha sido aprobada por el administrador.</p>
      </div>

      {/* Información sobre Fase 3 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Sobre la Fase 3</h4>
        <div className="space-y-3 text-blue-800">
          <p>En esta fase deberá completar un formulario más detallado que incluye:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Información detallada sobre la discapacidad</li>
            <li>Requisitos de registro y documentación</li>
            <li>Formulario de inscripción al programa</li>
            <li>Datos socioeconómicos</li>
            <li>Subida de documentos requeridos</li>
          </ul>
        </div>
      </div>

      {/* Comentario del administrador si existe */}
      {record.notes && record.notes.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Comentario del Administrador</h4>
          <div className="space-y-2">
            {record.notes.map((note, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-700">{note.note}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para continuar */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          Continuar a Fase 3
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Phase3Info;
