import React, { useEffect, useRef } from 'react';

interface TicketConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const TicketConversationModal: React.FC<TicketConversationModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[110] flex items-stretch sm:items-center sm:justify-center bg-black/50 p-0 sm:p-4"
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full h-[100dvh] sm:h-[90dvh] sm:max-h-[900px] sm:max-w-5xl rounded-none sm:rounded-xl shadow-xl overflow-hidden flex flex-col min-h-0 isolate [contain:layout_style_paint]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default TicketConversationModal;

