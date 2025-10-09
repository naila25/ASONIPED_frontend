import React from "react";

interface ModalSimpleProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalSimple({ onClose, children }: ModalSimpleProps) {
  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[calc(100vh-2rem)] my-8 overflow-hidden flex flex-col">
        <div className="flex justify-end p-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-200"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
