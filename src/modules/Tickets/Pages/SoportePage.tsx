import React, { lazy, Suspense, startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { FaHeadset, FaTicketAlt } from 'react-icons/fa';
import AnonymousTicketLookup from '../Components/AnonymousTicketLookup';
import TicketSupportForm from '../Components/TicketSupportForm';
import TicketConversationModal from '../Components/TicketConversationModal';

const AnonymousTicketConversation = lazy(() => import('../Components/AnonymousTicketConversation'));
const TicketConversation = lazy(() => import('../Components/TicketConversation'));
import type { AnonymousTicket } from '../Services/anonymousTicketService';
import type { DonationTicket } from '../Services/ticketService';
import { getAnonymousTicketByTicketId } from '../Services/anonymousTicketService';
import { getTicketById } from '../Services/ticketService';

const modalConversationFallback = (
  <div className="flex flex-1 min-h-[40vh] items-center justify-center bg-white">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" aria-hidden />
    <span className="sr-only">Cargando conversación…</span>
  </div>
);

const SoportePage: React.FC = () => {
  const [activeAnonymousTicket, setActiveAnonymousTicket] = useState<AnonymousTicket | null>(null);
  const [activeTicket, setActiveTicket] = useState<DonationTicket | null>(null);
  const [supportMode, setSupportMode] = useState<'create' | 'open'>('create');

  const activeAnonTicketIdRef = useRef<string | null>(null);
  const activeAuthTicketIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeAnonTicketIdRef.current = activeAnonymousTicket?.ticket_id ?? null;
  }, [activeAnonymousTicket?.ticket_id]);

  useEffect(() => {
    activeAuthTicketIdRef.current = activeTicket?.id ?? null;
  }, [activeTicket?.id]);

  const refreshAnonymousTicket = useCallback(async () => {
    const id = activeAnonTicketIdRef.current;
    if (!id) return;
    const updated = await getAnonymousTicketByTicketId(id);
    setActiveAnonymousTicket(updated);
  }, []);

  const refreshAuthTicket = useCallback(async () => {
    const id = activeAuthTicketIdRef.current;
    if (id == null) return;
    const updated = await getTicketById(id);
    setActiveTicket(updated);
  }, []);

  const handleAnonymousCreated = (ticket: AnonymousTicket) => {
    startTransition(() => {
      setActiveAnonymousTicket(ticket);
      setActiveTicket(null);
    });
  };

  const handleAuthenticatedCreated = (ticket: DonationTicket) => {
    startTransition(() => {
      setActiveTicket(ticket);
      setActiveAnonymousTicket(null);
    });
  };

  const handleCloseAnonymousConversation = () => {
    startTransition(() => setActiveAnonymousTicket(null));
  };

  const handleCloseAuthConversation = () => {
    startTransition(() => setActiveTicket(null));
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

        {!activeAnonymousTicket && !activeTicket && (
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
        )}

        <div className="grid lg:grid-cols-3 gap-8 lg:items-start">
          {/* Main Content - Create ticket + Conversation */}
          <div className="lg:col-span-2">
            {!activeAnonymousTicket && !activeTicket && (
              <>
                {supportMode === 'create' ? (
                  <TicketSupportForm
                    onAnonymousCreated={handleAnonymousCreated}
                    onAuthenticatedCreated={handleAuthenticatedCreated}
                  />
                ) : (
                  <div className="mt-2">
                    <AnonymousTicketLookup
                      onTicketFound={(ticket) => {
                        startTransition(() => {
                          setActiveAnonymousTicket(ticket);
                          setActiveTicket(null);
                        });
                      }}
                    />
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
              <ol className="m-0 list-none space-y-4 p-0 text-sm text-gray-600">
                <li className="grid grid-cols-[1.5rem_1fr] items-start gap-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                    1
                  </span>
                  <p className="m-0 min-w-0 leading-relaxed">
                    Crea un ticket en el formulario (anónimo o con cuenta)
                  </p>
                </li>
                <li className="grid grid-cols-[1.5rem_1fr] items-start gap-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                    2
                  </span>
                  <p className="m-0 min-w-0 leading-relaxed">
                    Si envías anónimo, copia y guarda tu código de ticket (p. ej. TMNW22ZUSJJ0H); lo
                    necesitarás en &quot;Abrir ticket&quot; si cierras la ventana
                  </p>
                </li>
                <li className="grid grid-cols-[1.5rem_1fr] items-start gap-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                    3
                  </span>
                  <p className="m-0 min-w-0 leading-relaxed">
                    La conversación se abre en una ventana modal; puedes cerrarla y volver con tu código
                  </p>
                </li>
              </ol>
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
          <Suspense fallback={modalConversationFallback}>
            <AnonymousTicketConversation
              ticket={{ ...activeAnonymousTicket, asunto: activeAnonymousTicket.asunto ?? '' }}
              onClose={handleCloseAnonymousConversation}
              onTicketUpdate={refreshAnonymousTicket}
            />
          </Suspense>
        </TicketConversationModal>
      )}

      {/* Authenticated conversation in modal */}
      {activeTicket && (
        <TicketConversationModal
          isOpen={true}
          onClose={handleCloseAuthConversation}
        >
          <Suspense fallback={modalConversationFallback}>
            <TicketConversation
              ticket={activeTicket}
              onClose={handleCloseAuthConversation}
              onTicketUpdate={refreshAuthTicket}
            />
          </Suspense>
        </TicketConversationModal>
      )}
    </div>
  );
};

export default SoportePage;
