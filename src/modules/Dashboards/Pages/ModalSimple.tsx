import React from "react";

interface ModalSimpleProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalSimple({ onClose, children }: ModalSimpleProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="h-auto overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}
