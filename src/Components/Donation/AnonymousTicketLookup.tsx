import React, { useState } from 'react';
import { FaTicketAlt, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { getAnonymousTicketByTicketId } from '../../Utils/anonymousTicketService';
import type { AnonymousTicket } from '../../Utils/anonymousTicketService';
import AnonymousTicketConversation from './AnonymousTicketConversation';

const AnonymousTicketLookup: React.FC = () => {
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState<AnonymousTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketId.trim()) {
      setError('Por favor ingresa un ID de ticket válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const ticketData = await getAnonymousTicketByTicketId(ticketId.trim());
      setTicket(ticketData);
    } catch (err) {
      setError('Ticket no encontrado. Verifica el ID e intenta de nuevo.');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConversation = () => {
    setTicket(null);
    setTicketId('');
    setError(null);
  };

  if (ticket) {
    return (
      <AnonymousTicketConversation 
        ticket={ticket} 
        onClose={handleCloseConversation}
        onTicketUpdate={() => {}} // No need to update anything in lookup mode
      />
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <FaTicketAlt className="text-orange-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Acceder a tu Ticket
        </h2>
        <p className="text-gray-600">
          Ingresa el ID de tu ticket para continuar con la conversación
        </p>
      </div>

      <form onSubmit={handleLookup} className="space-y-4">
        <div>
          <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700 mb-2">
            ID del Ticket
          </label>
          <div className="relative">
            <input
              type="text"
              id="ticketId"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              placeholder="Ej: T123ABC"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
              disabled={loading}
            />
            <FaTicketAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !ticketId.trim()}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Buscando...
            </>
          ) : (
            <>
              <FaSearch />
              Buscar Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AnonymousTicketLookup;
