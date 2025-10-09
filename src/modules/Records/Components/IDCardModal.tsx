import React, { useEffect, useState } from 'react';
import { X, IdCard } from 'lucide-react';
import IDCard from './IDCard';
import type { RecordWithDetails } from '../Types/records';
import { getRecordById } from '../Services/recordsApi';

type IDCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recordId: number;
};

const IDCardModal: React.FC<IDCardModalProps> = ({ isOpen, onClose, recordId }) => {
  const [record, setRecord] = useState<RecordWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecordById(recordId);
        setRecord(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando expediente');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, recordId]);

  const handlePrint = () => {
    const container = document.getElementById('idcard-print');
    if (!container) return window.print();
    const cardHTML = container.innerHTML;
    const styleTags = Array.from(document.querySelectorAll('style'))
      .map((el) => el.outerHTML)
      .join('\n');
    const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((el) => (el as HTMLLinkElement).outerHTML)
      .join('\n');
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return window.print();
    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Carnet</title>
        ${linkTags}
        ${styleTags}
        <style>
          @page { size: A4; margin: 12mm; }
          html, body { height: 100%; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; display: grid; place-items: center; }
          .wrapper { display: grid; place-items: center; }
        </style>
      </head>
      <body>
        <div class="wrapper">${cardHTML}</div>
      </body>
      </html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <IdCard className="w-5 h-5 text-blue-600" />
            Carnet de Identificación
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 print:hidden">Descargar PDF</button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors print:hidden" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {loading && <div className="text-center text-gray-600">Cargando...</div>}
          {error && <div className="text-center text-red-600">{error}</div>}
          {record && (
            <div className="flex justify-center">
              <div id="idcard-print">
                <IDCard record={record} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IDCardModal;



