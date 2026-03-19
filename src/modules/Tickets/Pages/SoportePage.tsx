import React, { useCallback, useState } from 'react';
import { FaHeadset, FaTicketAlt } from 'react-icons/fa';
import AnonymousTicketLookup from '../Components/AnonymousTicketLookup';
import TicketSupportForm from '../Components/TicketSupportForm';
import AnonymousTicketConversation from '../Components/AnonymousTicketConversation';
import TicketConversation from '../Components/TicketConversation';
import TicketConversationModal from '../Components/TicketConversationModal';
import type { AnonymousTicket } from '../Services/anonymousTicketService';
import type { DonationTicket } from '../Services/ticketService';
import { getAnonymousTicketByTicketId } from '../Services/anonymousTicketService';
import { getTicketById } from '../Services/ticketService';

const SoportePage: React.FC = () => {
  const [activeAnonymousTicket, setActiveAnonymousTicket] = useState<AnonymousTicket | null>(null);
  const [activeTicket, setActiveTicket] = useState<DonationTicket | null>(null);
  const [supportMode, setSupportMode] = useState<'create' | 'open'>('create');

  const refreshAnonymousTicket = useCallback(async () => {
    if (!activeAnonymousTicket) return;
    const updated = await getAnonymousTicketByTicketId(activeAnonymousTicket.ticket_id);
    setActiveAnonymousTicket(updated);
  }, [activeAnonymousTicket]);

  const refreshAuthTicket = useCallback(async () => {
    if (!activeTicket) return;
    const updated = await getTicketById(activeTicket.id);
    setActiveTicket(updated);
  }, [activeTicket]);

  const handleAnonymousCreated = (ticket: AnonymousTicket) => {
    setActiveAnonymousTicket(ticket);
    setActiveTicket(null);
  };

  const handleAuthenticatedCreated = (ticket: DonationTicket) => {
    setActiveTicket(ticket);
    setActiveAnonymousTicket(null);
  };

  const handleCloseAnonymousConversation = () => {
    setActiveAnonymousTicket(null);
  };

  const handleCloseAuthConversation = () => {
    setActiveTicket(null);
  };

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
          {/* Main Content - Create ticket + Conversation */}
          <div className="lg:col-span-2">
            {!activeAnonymousTicket && !activeTicket && (
              <>
                <div className="mb-6">
                  <div className="flex gap-3 justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={() => setSupportMode('create')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        supportMode === 'create'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Crear ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportMode('open')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        supportMode === 'open'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Abrir ticket
                    </button>
                  </div>
                </div>

                {supportMode === 'create' ? (
                  <TicketSupportForm
                    onAnonymousCreated={handleAnonymousCreated}
                    onAuthenticatedCreated={handleAuthenticatedCreated}
                  />
                ) : (
                  <div className="mt-2">
                    <AnonymousTicketLookup />
                  </div>
                )}
              </>
            )}
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
                  <p>Crea un ticket en el formulario (anónimo o con cuenta)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>Si envías anónimo, recibe tu ID de ticket único</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>Continúa la conversación aquí (se abre en la misma página)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Anonymous conversation in modal */}
      {activeAnonymousTicket && (
        <TicketConversationModal
          isOpen={true}
          onClose={handleCloseAnonymousConversation}
        >
          <AnonymousTicketConversation
            ticket={{ ...activeAnonymousTicket, asunto: activeAnonymousTicket.asunto ?? '' }}
            onClose={handleCloseAnonymousConversation}
            onTicketUpdate={refreshAnonymousTicket}
          />
        </TicketConversationModal>
      )}

      {/* Authenticated conversation in modal */}
      {activeTicket && (
        <TicketConversationModal
          isOpen={true}
          onClose={handleCloseAuthConversation}
        >
          <TicketConversation
            ticket={activeTicket}
            onClose={handleCloseAuthConversation}
            onTicketUpdate={refreshAuthTicket}
          />
        </TicketConversationModal>
      )}
    </div>
  );
};

export default SoportePage;
