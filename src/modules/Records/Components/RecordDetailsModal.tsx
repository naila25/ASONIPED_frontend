import React, { useEffect, useRef } from 'react';
import { X, Edit3 } from 'lucide-react';
import CompleteRecordView from './CompleteRecordView';
import type { RecordWithDetails } from '../Types/records';

interface RecordDetailsModalProps {
  isOpen: boolean;
  record: RecordWithDetails | null;
  onClose: () => void;
  editHref?: string;
  /** Optional footer (e.g. action buttons: approve, reject, add note) */
  children?: React.ReactNode;
}

const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  isOpen,
  record,
  onClose,
  editHref,
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen || !record) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="record-details-title"
    >
      <div
        className="bg-white w-full h-full sm:h-[90vh] sm:max-h-[900px] sm:max-w-5xl sm:rounded-xl shadow-xl flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
          <h2 id="record-details-title" className="font-semibold text-gray-900 truncate">
            {record.record_number}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            {editHref && (
              <a
                href={editHref}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </a>
            )}
          </div>
        </div>

        {/* Body: scrollable CompleteRecordView */}
        <div className="flex-1 overflow-auto min-h-0">
          <CompleteRecordView record={record} isAdmin={true} />
        </div>

        {/* Optional footer (actions): scrollable on small screens if many buttons */}
        {children && (
          <div className="border-t border-gray-200 bg-gray-50 px-3 sm:px-4 py-3 shrink-0 overflow-auto min-w-0 max-h-[40vh] sm:max-h-none">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordDetailsModal;
