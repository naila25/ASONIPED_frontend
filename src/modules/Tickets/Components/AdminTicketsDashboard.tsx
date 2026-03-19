import React, { useState, useEffect, useMemo } from 'react';
import { getAllTickets, closeTicket, archiveTicket } from '../Services/ticketService';
import type { DonationTicket } from '../Services/ticketService';
import { closeAnonymousTicket, archiveAnonymousTicket } from '../Services/anonymousTicketService';
import { FaTicketAlt, FaCheckCircle, FaEye, FaSearch, FaArchive } from 'react-icons/fa';
import TicketConversation from '../Components/TicketConversation';
import AdminAnonymousTicketConversation from './AdminAnonymousTicketConversation';

const AdminTicketsDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<DonationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<DonationTicket | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    assigned: 0,
    unassigned: 0,
    archived: 0
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await getAllTickets();

      // Always update tickets to reflect status changes (open -> closed -> archived)
      setTickets(ticketsData);
      calculateStats(ticketsData);
      setError(null);
    } catch {
      setError('Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();

    // Cleanup function to prevent memory leaks
    return () => {
      setTickets([]);
      setStats({
        total: 0,
        open: 0,
        closed: 0,
        assigned: 0,
        unassigned: 0,
        archived: 0
      });
    };
  }, []);

  const calculateStats = (ticketsData: DonationTicket[]) => {
    const total = ticketsData.length;
    const open = ticketsData.filter((t) => t.status === 'open').length;
    const closed = ticketsData.filter((t) => t.status === 'closed').length;
    const assigned = ticketsData.filter((t) => t.assigned_admin_id).length;
    const unassigned = total - assigned;
    const archived = ticketsData.filter((t) => t.status === 'archived').length;

    setStats({ total, open, closed, assigned, unassigned, archived });
  };

  const handleCloseTicket = async (ticket: DonationTicket) => {
    try {
      if (ticket.ticket_type === 'anonymous') {
        await closeAnonymousTicket(ticket.id);
      } else {
        await closeTicket(ticket.id);
      }

      await loadTickets(); // Reload tickets

      // Update selectedTicket state if it's the same ticket
      if (selectedTicket && selectedTicket.id === ticket.id) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: 'closed' as const } : null));
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      setError('Error closing ticket');
    }
  };

  const handleArchiveTicket = async (ticket: DonationTicket) => {
    try {
      if (ticket.ticket_type === 'anonymous') {
        await archiveAnonymousTicket(ticket.id);
      } else {
        await archiveTicket(ticket.id);
      }
      await loadTickets(); // Reload tickets

      // Update selectedTicket state if it's the same ticket
      if (selectedTicket && selectedTicket.id === ticket.id) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: 'archived' as const } : null));
      }
    } catch {
      setError('Error archiving ticket');
    }
  };

  const handleViewConversation = (ticket: DonationTicket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseConversation = () => {
    setSelectedTicket(null);
    // Don't reload tickets here - it's not necessary and can cause duplication
  };

  // Filter tickets using useMemo to prevent unnecessary recalculations
  const filteredTickets = useMemo(() => {
    // Remove duplicates by ID to prevent multiplication issues
    const uniqueTickets = tickets.filter(
      (ticket, index, self) => index === self.findIndex((t) => t.id === ticket.id)
    );

    const filtered = uniqueTickets.filter((ticket) => {
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesSearch =
        searchTerm === '' ||
        ticket.asunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.correo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAssigned =
        assignedFilter === 'all' ||
        (assignedFilter === 'assigned' && ticket.assigned_admin_id) ||
        (assignedFilter === 'unassigned' && !ticket.assigned_admin_id);
      const matchesArchived = showArchived || ticket.status !== 'archived';

      return matchesStatus && matchesSearch && matchesAssigned && matchesArchived;
    });

    // Debug: Log filtering results
    console.log('🔍 Filtering tickets:', {
      original: tickets.length,
      unique: uniqueTickets.length,
      filtered: filtered.length,
      showArchived,
      statusFilter,
      searchTerm,
      assignedFilter
    });

    return filtered;
  }, [tickets, statusFilter, searchTerm, assignedFilter, showArchived]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'open':
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`}>
            Abierto
          </span>
        );
      case 'closed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}>
            Cerrado
          </span>
        );
      case 'archived':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}>
            Archivado
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}>
            Pendiente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Cargando tickets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <button
          onClick={loadTickets}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
  
    <div className="space-y-6">
      {/* Header / Filters */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por asunto, nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'open' | 'closed' | 'archived')
              }
              className="h-10 w-full sm:w-56 px-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="open">Abiertos</option>
              <option value="closed">Cerrados</option>
              <option value="archived">Archivados</option>
            </select>

            <button
              onClick={() => setShowArchived((v) => !v)}
              className="h-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 whitespace-nowrap sm:text-sm"
            >
              {showArchived ? 'Ocultar archivados' : 'Mostrar archivados'}
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTicketAlt className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay tickets</h3>
            <p className="text-gray-600">No se encontraron tickets que coincidan con los filtros.</p>
          </div>
        ) : (
          filteredTickets.map((ticket: DonationTicket) => (
            <div key={ticket.id}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaTicketAlt className="text-orange-500" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Ticket #{ticket.id} - {ticket.asunto}
                        </h3>

                        {getStatusBadge(ticket.status)}

                        {/* Ticket type badge */}
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                            ticket.ticket_type === 'anonymous'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {ticket.ticket_type === 'anonymous' ? 'Anónimo' : 'Registrado'}
                        </span>

                        {/* Public ticket ID for anonymous tickets */}
                        {ticket.ticket_type === 'anonymous' && ticket.ticket_id && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            ID: {ticket.ticket_id}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        {ticket.ticket_type === 'anonymous' ? (
                          <>
                            <p>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Tipo
                              </span>
                              : <span className="font-medium">Usuario Anónimo</span>
                            </p>
                            {ticket.nombre && (
                              <p>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                  Nombre
                                </span>
                                : <span className="font-medium">{ticket.nombre}</span>
                              </p>
                            )}
                            {ticket.correo && (
                              <p>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                  Correo
                                </span>
                                : <span className="font-medium">{ticket.correo}</span>
                              </p>
                            )}
                          </>
                        ) : (
                          <p>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                              Solicitante
                            </span>
                            :{' '}
                            <span className="font-medium">
                              {ticket.nombre} ({ticket.correo})
                            </span>
                          </p>
                        )}

                        <p>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Creado</span>:{' '}
                          <span className="font-medium">{formatDate(ticket.created_at)}</span>
                        </p>
                        {ticket.closed_at && (
                          <p>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                              Cerrado
                            </span>
                            : <span className="font-medium">{formatDate(ticket.closed_at)}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        onClick={() => handleViewConversation(ticket)}
                      >
                        <FaEye />
                        Ver conversación
                      </button>

                      {ticket.status === 'open' && (
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          onClick={() => handleCloseTicket(ticket)}
                        >
                          <FaCheckCircle />
                          Cerrar
                        </button>
                      )}

                      {ticket.status === 'closed' && (
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          onClick={() => handleArchiveTicket(ticket)}
                        >
                          <FaArchive />
                          Archivar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversation opens below the specific ticket */}
              {selectedTicket && selectedTicket.id === ticket.id && (
                <div className="mt-4">
                  {selectedTicket.ticket_type === 'anonymous' ? (
                    <AdminAnonymousTicketConversation
                      ticket={{
                        id: selectedTicket.id,
                        ticket_id: selectedTicket.ticket_id || '',
                        asunto: selectedTicket.asunto || '',
                        mensaje: selectedTicket.mensaje,
                        status: selectedTicket.status
                      }}
                      onClose={handleCloseConversation}
                      onTicketUpdate={() => {
                        // Only reload if the ticket status actually changed
                        if (selectedTicket.status !== 'open') {
                          loadTickets();
                        }
                      }}
                    />
                  ) : (
                    <TicketConversation
                      ticket={selectedTicket}
                      onClose={handleCloseConversation}
                      onTicketUpdate={() => {
                        // Only reload if the ticket status actually changed
                        if (selectedTicket.status !== 'open') {
                          loadTickets();
                        }
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTicketsDashboard;