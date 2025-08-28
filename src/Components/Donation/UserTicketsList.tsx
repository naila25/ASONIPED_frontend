import React, { useState, useEffect } from 'react';
import { DonationTicket, getTicketsByUserId } from '../../Utils/ticketService';
import { FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import TicketConversation from './TicketConversation';
import TicketPreview from './TicketPreview';

interface UserTicketsListProps {
  userId: number;
}

const UserTicketsList: React.FC<UserTicketsListProps> = ({ userId }) => {
  const [tickets, setTickets] = useState<DonationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedTicket, setSelectedTicket] = useState<DonationTicket | null>(null);

  useEffect(() => {
    loadTickets();
  }, [userId]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const userTickets = await getTicketsByUserId(userId);
      setTickets(userTickets);
      setError(null);
    } catch (err) {
      setError('Error al cargar los tickets');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = (ticket: DonationTicket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseConversation = () => {
    setSelectedTicket(null);
    loadTickets(); // Recargar tickets para actualizar estados
  };

  const filteredTickets = tickets.filter(ticket => {
    if (selectedStatus === 'all') return true;
    return ticket.status === selectedStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: 'open' | 'closed') => {
    return status === 'open' ? (
      <FaClock className="text-orange-500" />
    ) : (
      <FaCheckCircle className="text-green-500" />
    );
  };

  const getStatusText = (status: 'open' | 'closed') => {
    return status === 'open' ? 'Abierto' : 'Cerrado';
  };

  const getStatusBadge = (status: 'open' | 'closed') => {
    return status === 'open' ? (
      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Abierto
      </span>
    ) : (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Cerrado
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadTickets}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Tickets de Donación</h2>
          <p className="text-gray-600">Gestiona tus solicitudes de donación</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'open' | 'closed')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los tickets</option>
            <option value="open">Abiertos</option>
            <option value="closed">Cerrados</option>
          </select>
        </div>
      </div>

      {/* Lista de tickets */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaTicketAlt className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {selectedStatus === 'all' ? 'No tienes tickets' : `No tienes tickets ${selectedStatus === 'open' ? 'abiertos' : 'cerrados'}`}
          </h3>
          <p className="text-gray-500">
            {selectedStatus === 'all' 
              ? 'Cuando envíes una donación, aparecerá aquí como un ticket de soporte.'
              : 'No hay tickets con este estado.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-2">
                     <FaTicketAlt className="text-orange-500" />
                     <h3 className="font-semibold text-gray-800">
                       Ticket #{ticket.id} - {ticket.asunto}
                     </h3>
                     {getStatusBadge(ticket.status)}
                     {ticket.status === 'open' && (
                       <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                         Activo
                       </span>
                     )}
                   </div>
                  
                                     <div className="text-sm text-gray-600 space-y-1">
                     <p><strong>Asunto:</strong> {ticket.asunto}</p>
                     <p><strong>Creado:</strong> {formatDate(ticket.created_at)}</p>
                     {ticket.closed_at && (
                       <p><strong>Cerrado:</strong> {formatDate(ticket.closed_at)}</p>
                     )}
                     {ticket.admin_name && (
                       <p><strong>Asignado a:</strong> {ticket.admin_name}</p>
                     )}
                   </div>
                   
                   {/* Vista previa de mensajes */}
                   <div className="mt-3">
                     <TicketPreview ticketId={ticket.id} maxMessages={1} />
                   </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={() => handleViewConversation(ticket)}
                  >
                    <FaEye />
                    Ver conversación
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      {tickets.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Resumen</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{tickets.length}</div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {tickets.filter(t => t.status === 'open').length}
              </div>
              <div className="text-gray-600">Abiertos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {tickets.filter(t => t.status === 'closed').length}
              </div>
              <div className="text-gray-600">Cerrados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {tickets.filter(t => t.assigned_admin_id).length}
              </div>
              <div className="text-gray-600">Asignados</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de conversación */}
      {selectedTicket && (
        <TicketConversation
          ticket={selectedTicket}
          onClose={handleCloseConversation}
          onTicketUpdate={loadTickets}
        />
      )}
    </div>
  );
};

export default UserTicketsList;
