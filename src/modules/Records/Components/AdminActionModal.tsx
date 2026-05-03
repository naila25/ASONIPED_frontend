import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface AdminActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  comment: string;
  setComment: (value: string) => void;
  requireComment?: boolean;
  /** When true, comment field is hidden (e.g. simple confirmations like delete) */
  hideComment?: boolean;
  /**
   * Primary button color. If omitted: danger (red) when requireComment, otherwise success (green).
   * Use `danger` for delete/destructive actions even when no comment is required.
   */
  confirmTone?: 'success' | 'danger' | 'warning';
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
  hideComment = false,
  confirmTone,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
  recordNumber,
  recordName
}) => {
  const isConfirmDisabled = useMemo(() => 
    loading || (!hideComment && requireComment && !comment.trim()), 
    [loading, hideComment, requireComment, comment]
  );

  const resolvedTone = confirmTone ?? (requireComment ? 'danger' : 'success');
  const confirmButtonClass =
    resolvedTone === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : resolvedTone === 'warning'
        ? 'bg-amber-600 hover:bg-amber-700'
        : 'bg-green-600 hover:bg-green-700';

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC (only while open — avoids duplicate listeners when parent keeps mounted)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, loading, onCancel]);

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
  }, [setComment]);

  useEffect(() => {
    if (import.meta.env.DEV && isOpen) {
      console.log('[AdminActionModal] mounted/open', { title, requireComment });
    }
  }, [isOpen, title, requireComment]);

  if (!isOpen) return null;

  /** Render at `document.body` so `position:fixed` is not trapped by admin `<main className="overflow-y-auto">` (otherwise the dialog can be clipped or not visible). */
  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all"
        onMouseDown={(e) => e.stopPropagation()}
      >
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

        {!hideComment && (
          <>
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
          </>
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
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${confirmButtonClass}`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};

export default AdminActionModal;


