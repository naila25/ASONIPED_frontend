import React from 'react';
import { FaHeadset, FaTicketAlt } from 'react-icons/fa';
import AnonymousTicketLookup from '../Components/AnonymousTicketLookup';

const SoportePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
            <FaHeadset className="text-3xl text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Centro de Soporte
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accede a tu ticket de para recibir asistencia.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Ticket Lookup */}
          <div className="lg:col-span-2">
            <AnonymousTicketLookup />
          </div>

          {/* Sidebar - Information */}
          <div className="space-y-6">
            {/* How it works */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaTicketAlt className="text-orange-500" />
                ¿Cómo funciona?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p>Crea una Ticket en nuestro formulario</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>Recibe tu ID de Ticket único</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>Accede aquí para continuar la conversación</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoportePage;
