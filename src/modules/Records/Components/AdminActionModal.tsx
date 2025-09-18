import React, { useEffect, useRef, useCallback, useMemo } from 'react';

interface AdminActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  comment: string;
  setComment: (value: string) => void;
  requireComment?: boolean;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  recordNumber?: string;
  recordName?: string;
}

const AdminActionModal: React.FC<AdminActionModalProps> = ({
  isOpen,
  title,
  message,
  comment,
  setComment,
  requireComment = false,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
  recordNumber,
  recordName
}) => {
  if (!isOpen) return null;

  const isConfirmDisabled = useMemo(() => 
    loading || (requireComment && !comment.trim()), 
    [loading, requireComment, comment]
  );

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [loading, onCancel]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !loading) {
      onCancel();
    }
  }, [loading, onCancel]);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (next.length <= 500) {
      setComment(next);
    }
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            disabled={loading}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {(recordNumber || recordName) && (
          <div className="text-sm text-gray-600 mb-3">
            {recordNumber && <div><span className="font-medium">Expediente:</span> {recordNumber}</div>}
            {recordName && <div><span className="font-medium">Persona:</span> {recordName}</div>}
          </div>
        )}

        <p className="text-gray-700 mb-4">{message}</p>

        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Comentario {requireComment && <span className="text-red-600">(requerido)</span>}
          </label>
          <span className="text-xs text-gray-400">{comment.length}/500</span>
        </div>
        <textarea
          value={comment}
          onChange={handleCommentChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          placeholder={requireComment ? 'Describa el motivo...' : 'Comentario (opcional)'}
        />

        {requireComment && !comment.trim() && (
          <p className="text-xs text-red-600 -mt-3 mb-3">El comentario es obligatorio para esta acción.</p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
              requireComment ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminActionModal;


