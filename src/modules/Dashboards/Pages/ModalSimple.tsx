import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalSimpleProps {
  onClose: () => void;
  children: React.ReactNode;
}

/** Portal keeps the overlay out of nested stacking contexts; memo avoids extra work when parent re-renders. */
export const ModalSimple = React.memo(function ModalSimple({ onClose, children }: ModalSimpleProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="my-8 flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl contain-content">
        <div className="flex flex-shrink-0 justify-end p-2">
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-gray-400 transition-colors duration-200 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>,
    document.body
  );
});
