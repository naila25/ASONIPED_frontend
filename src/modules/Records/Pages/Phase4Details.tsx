import React from 'react';
import CompleteRecordView from '../Components/CompleteRecordView';
import type { RecordWithDetails } from '../Types/records';

interface Phase4DetailsProps {
  record: RecordWithDetails;
  hideHeader?: boolean;
}

const Phase4Details: React.FC<Phase4DetailsProps> = ({ record, hideHeader = false }) => {
  return (
    <div className="space-y-6">
      {/* Encabezado especial para Fase 4 */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-900">
                  {record.phase === 'completed' ? 'Expediente Completo - Finalizado' : 'Expediente Completo - Fase 4'}
                </h3>
                <p className="text-green-700">
                  {record.phase === 'completed' ? 'Expediente aprobado y finalizado' : 'Revisión Final - Expediente listo para aprobación'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {record.phase === 'completed' ? 'Completado' : 'Fase 4 - Revisión Final'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista completa del expediente */}
      <CompleteRecordView record={record} isAdmin={true} />
    </div>
  );
};

export default Phase4Details;
