import React from 'react';
import IDCard from '../Components/IDCard';
import type { RecordWithDetails } from '../Types/records';

type IDCardViewProps = {
  record: RecordWithDetails;
};

// Page-like wrapper that shows the ID card and offers a print-to-PDF action.
const IDCardView: React.FC<IDCardViewProps> = ({ record }) => {
  const handleDownloadPdf = () => {
    // Use native print; users can select "Save as PDF". This avoids extra deps.
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h1 className="text-xl font-semibold text-gray-900">Carnet de Identificación</h1>
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Descargar PDF
          </button>
        </div>

        <div className="flex items-center justify-center">
          <IDCard record={record} />
        </div>
      </div>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: #fff !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default IDCardView;


