import React, {
  lazy,
  memo,
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { getTicketsByUserId } from '../Services/ticketService';
import type { DonationTicket } from '../Services/ticketService';
import { FaTicketAlt, FaTimesCircle, FaEye } from 'react-icons/fa';
import TicketPreview from './TicketPreview';
import TicketConversationModal from './TicketConversationModal';

const TicketConversation = lazy(() => import('./TicketConversation'));

const modalConversationFallback = (
  <div className="flex flex-1 min-h-[40vh] items-center justify-center bg-white">
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500"
      aria-hidden
    />
    <span className="sr-only">Cargando conversación…</span>
  </div>
);

function formatTicketListDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(status: 'open' | 'closed' | 'archived') {
  switch (status) {
    case 'open':
      return (
        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Abierto
        </span>
      );
    case 'closed':
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Cerrado
        </span>
      );
    case 'archived':
      return (
        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Archivado
        </span>
      );
    default:
      return (
        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Abierto
        </span>
      );
  }
}

type TicketRowProps = {
  ticket: DonationTicket;
  onViewConversation: (ticket: DonationTicket) => void;
};

const UserTicketRow = memo(function UserTicketRow({
  ticket,
  onViewConversation,
}: TicketRowProps) {
  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow [contain:layout]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <FaTicketAlt className="text-orange-500 shrink-0" />
              <h3 className="font-semibold text-gray-800">
                Ticket #{ticket.id} - {ticket.asunto}
              </h3>
              {statusBadge(ticket.status)}
              {ticket.status === 'open' && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Activo</span>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Asunto:</strong> {ticket.asunto}
              </p>
              <p>
                <strong>Creado:</strong> {formatTicketListDate(ticket.created_at)}
              </p>
              {ticket.closed_at && (
                <p>
                  <strong>Cerrado:</strong> {formatTicketListDate(ticket.closed_at)}
                </p>
              )}
              {ticket.admin_name && (
                <p>
                  <strong>Asignado a:</strong> {ticket.admin_name}
                </p>
              )}
            </div>

            <div className="mt-3">
              <TicketPreview ticketId={ticket.id} maxMessages={1} />
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              onClick={() => onViewConversation(ticket)}
            >
              <FaEye />
              Ver conversación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

interface UserTicketsListProps {
  userId: number;
}

const UserTicketsList: React.FC<UserTicketsListProps> = ({ userId }) => {
  const [tickets, setTickets] = useState<DonationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed' | 'archived'>('open');
  const [selectedTicket, setSelectedTicket] = useState<DonationTicket | null>(null);

  const loadTickets = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      if (mode === 'initial') setLoading(true);
      const userTickets = await getTicketsByUserId(userId);
      setTickets(userTickets);
      setError(null);
    } catch (err) {
      if (mode === 'initial') {
        setError('Error al cargar los tickets');
      }
      console.error('Error loading tickets:', err);
    } finally {
      if (mode === 'initial') setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadTickets('initial');
  }, [loadTickets]);

  const refreshTicketsLowPriority = useCallback(() => {
    startTransition(() => {
      void loadTickets('refresh');
    });
  }, [loadTickets]);

  const handleViewConversation = useCallback((ticket: DonationTicket) => {
    startTransition(() => setSelectedTicket(ticket));
  }, []);

  const handleCloseConversation = useCallback(() => {
    setSelectedTicket(null);
    startTransition(() => {
      void loadTickets('refresh');
    });
  }, [loadTickets]);

  const filteredTickets = tickets.filter(ticket => {
    if (selectedStatus === 'all') return true;
    return ticket.status === selectedStatus;
  });

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
          type="button"
          onClick={() => void loadTickets('initial')}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Tickets</h2>
          <p className="text-gray-600">Gestiona tus solicitudes de Tickets</p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={e =>
              startTransition(() =>
                setSelectedStatus(e.target.value as 'all' | 'open' | 'closed' | 'archived')
              )
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los tickets</option>
            <option value="open">Abiertos</option>
            <option value="closed">Cerrados</option>
            <option value="archived">Archivados</option>
          </select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaTicketAlt className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {selectedStatus === 'all'
              ? 'No tienes tickets'
              : `No tienes tickets ${selectedStatus === 'open' ? 'abiertos' : 'cerrados'}`}
          </h3>
          <p className="text-gray-500">
            {selectedStatus === 'all'
              ? 'Cuando envíes una donación, aparecerá aquí como un ticket de soporte.'
              : 'No hay tickets con este estado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 [contain:layout]">
          {filteredTickets.map(ticket => (
            <UserTicketRow
              key={ticket.id}
              ticket={ticket}
              onViewConversation={handleViewConversation}
            />
          ))}
        </div>
      )}

      {selectedTicket && (
        <TicketConversationModal isOpen={true} onClose={handleCloseConversation}>
          <Suspense fallback={modalConversationFallback}>
            <TicketConversation
              ticket={selectedTicket}
              onClose={handleCloseConversation}
              onTicketUpdate={refreshTicketsLowPriority}
            />
          </Suspense>
        </TicketConversationModal>
      )}
    </div>
  );
};

export default UserTicketsList;
