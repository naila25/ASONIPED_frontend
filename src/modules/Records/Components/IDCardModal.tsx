import React, { useEffect, useRef, useState } from 'react';
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
  const [isPrinting, setIsPrinting] = useState(false);
  const printRootRef = useRef<HTMLDivElement | null>(null);

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

  const handlePrint = async () => {
    // Print in the same window to preserve blob: URLs and avoid broken images/layout in PDF.
    setIsPrinting(true);

    // Wait a tick so the DOM can apply print-only styles.
    await new Promise((r) => setTimeout(r, 0));

    // Clone the card into <body> so the modal layout doesn't affect pagination/printing.
    const source = document.getElementById('idcard-print');
    if (printRootRef.current) {
      printRootRef.current.remove();
      printRootRef.current = null;
    }

    const printRoot = document.createElement('div');
    printRoot.id = 'idcard-print-root';
    printRootRef.current = printRoot;
    document.body.appendChild(printRoot);

    if (source) {
      const clone = source.cloneNode(true) as HTMLElement;
      clone.id = 'idcard-print-clone';
      clone.style.display = 'grid';
      clone.style.placeItems = 'center';
      printRoot.appendChild(clone);
    }

    // Ensure images (logo, photo blob:, and QR) are loaded before printing.
    const container = document.getElementById('idcard-print-clone') || source;
    const imgs = Array.from(container?.querySelectorAll('img') ?? []);
    await Promise.all(
      imgs.map(async (img) => {
        try {
          // If already loaded, skip.
          if (img.complete && img.naturalWidth > 0) return;
          // Prefer modern decode when available.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dec = (img as any).decode?.bind(img) as (() => Promise<void>) | undefined;
          if (dec) {
            await dec();
            return;
          }
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
          });
        } catch {
          // Ignore decode errors; we'll still attempt to print.
        }
      })
    );

    window.print();
  };

  useEffect(() => {
    if (!isPrinting) return;
    const handleAfterPrint = () => {
      setIsPrinting(false);
      if (printRootRef.current) {
        printRootRef.current.remove();
        printRootRef.current = null;
      }
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [isPrinting]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 print:p-0">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] min-w-0 flex flex-col overflow-hidden print:shadow-none print:max-h-none print:rounded-none print:max-w-none">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-gray-900 font-semibold min-w-0 truncate">
            <IdCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Carnet de Identificación</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handlePrint} className="px-3 py-2 min-h-[44px] sm:min-h-0 sm:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 print:hidden text-sm font-medium touch-manipulation">Descargar PDF</button>
            <button onClick={onClose} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors print:hidden touch-manipulation" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={`p-2 sm:p-4 overflow-auto min-h-0 flex-1 ${isPrinting ? 'print:p-0' : ''}`}>
          {loading && <div className="text-center text-gray-600 py-8">Cargando...</div>}
          {error && <div className="text-center text-red-600 py-8">{error}</div>}
          {record && (
            <div className="flex justify-center min-w-0">
              <div id="idcard-print" className="w-fit max-w-full min-w-0 mx-auto print:w-auto print:max-w-none">
                <IDCard record={record} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-only styling: print just the card */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { height: auto !important; }
          body { margin: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          /* Remove everything from layout except the print root (prevents blank pages) */
          body > *:not(#idcard-print-root) { display: none !important; }

          #idcard-print-root {
            display: grid !important;
            place-items: center !important;
            width: 100% !important;
          }

          /* Avoid page splitting */
          #idcard-print-clone { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default IDCardModal;



