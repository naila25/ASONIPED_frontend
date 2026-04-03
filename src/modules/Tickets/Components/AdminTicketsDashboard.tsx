import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllTickets, closeTicket, archiveTicket } from '../Services/ticketService';
import type { DonationTicket } from '../Services/ticketService';
import { closeAnonymousTicket, archiveAnonymousTicket } from '../Services/anonymousTicketService';
import { FaTicketAlt, FaCheckCircle, FaEye, FaSearch, FaArchive } from 'react-icons/fa';
import TicketConversation from '../Components/TicketConversation';
import AdminAnonymousTicketConversation from './AdminAnonymousTicketConversation';
import TicketConversationModal from './TicketConversationModal';

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
  const [pageSize, setPageSize] = useState<5 | 10>(10);
  const [page, setPage] = useState(1);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const ticketsData = await getAllTickets();

      // Always update tickets to reflect status changes (open -> closed -> archived)
      setTickets(ticketsData);
      setError(null);
    } catch {
      setError('Error loading tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();

    return () => {
      setTickets([]);
    };
  }, [loadTickets]);

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
    } catch {
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

    return filtered;
  }, [tickets, statusFilter, searchTerm, assignedFilter, showArchived]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm, showArchived, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paginatedTickets = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, clampedPage, pageSize]);

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
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Abierto
          </span>
        );
      case 'closed':
        return (
          <span className={`${baseClasses} bg-slate-100 text-slate-600 border border-slate-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
            Cerrado
          </span>
        );
      case 'archived':
        return (
          <span className={`${baseClasses} bg-slate-50 text-slate-500 border border-slate-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
            Archivado
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border border-amber-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Pendiente
          </span>
        );
    }
  };

  // Left border accent color per status
  const getCardAccent = (status: string) => {
    if (status === 'open')     return 'border-l-emerald-400';
    if (status === 'closed')   return 'border-l-slate-300';
    if (status === 'archived') return 'border-l-slate-200';
    return 'border-l-amber-400';
  };

  // Icon color per status
  const getIconColor = (status: string) => {
    if (status === 'open')     return 'text-emerald-500';
    if (status === 'closed')   return 'text-slate-400';
    if (status === 'archived') return 'text-slate-300';
    return 'text-amber-400';
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-3 sm:gap-4">
        <div className="relative w-full lg:flex-1 lg:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por asunto, nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'closed' | 'archived')}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="open">Abiertos</option>
            <option value="closed">Cerrados</option>
            <option value="archived">Archivados</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="shrink-0"
            />
            Mostrar Archivados
          </label>
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
          <>
            {/* Pagination controls (top) */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Mostrando{' '}
                  <span className="font-medium text-gray-800">
                    {(clampedPage - 1) * pageSize + 1}
                  </span>
                  {' - '}
                  <span className="font-medium text-gray-800">
                    {Math.min(clampedPage * pageSize, filteredTickets.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium text-gray-800">{filteredTickets.length}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Por página</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize((Number(e.target.value) as 5 | 10) || 10)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={clampedPage <= 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página <span className="font-medium text-gray-800">{clampedPage}</span> / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={clampedPage >= totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>

            {paginatedTickets.map((ticket: DonationTicket) => (
            <div key={ticket.id}>
              {/* Card con borde izquierdo de color según estado y padding más generoso */}
              <div className={`bg-white border border-gray-200 border-l-4 ${getCardAccent(ticket.status)} rounded-lg p-5 sm:p-7 hover:shadow-md transition-shadow`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      {/* Ícono toma el color del estado */}
                      <FaTicketAlt className={getIconColor(ticket.status)} />
                      <h3 className="font-semibold text-gray-800 break-words">
                        Ticket #{ticket.id} - {ticket.asunto}
                      </h3>
                      {/* Badge de estado con colores semánticos */}
                      {getStatusBadge(ticket.status)}
                      {ticket.status === 'open' && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Activo
                        </span>
                      )}
                      {/* Badge tipo de ticket:
                          anonymous  → violeta (identidad oculta)
                          registered → azul suave */}
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
                        ticket.ticket_type === 'anonymous'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                          ticket.ticket_type === 'anonymous' ? 'bg-violet-400' : 'bg-sky-400'
                        }`} />
                        {ticket.ticket_type === 'anonymous' ? 'Anónimo' : 'Registrado'}
                      </span>
                      {/* Show public ticket ID for anonymous tickets */}
                      {ticket.ticket_type === 'anonymous' && ticket.ticket_id && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-mono border border-gray-200">
                          {ticket.ticket_id}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {ticket.ticket_type === 'anonymous' ? (
                        <>
                          <p className="text-violet-600 font-medium">Usuario Anónimo</p>
                          {ticket.nombre && <p><strong>Nombre:</strong> {ticket.nombre}</p>}
                          {ticket.correo && <p><strong>Correo:</strong> {ticket.correo}</p>}
                        </>
                      ) : (
                        <p><strong>Solicitante:</strong> {ticket.nombre} ({ticket.correo})</p>
                      )}
                      <p><strong>Creado:</strong> {formatDate(ticket.created_at)}</p>
                      {ticket.closed_at && (
                        <p><strong>Cerrado:</strong> {formatDate(ticket.closed_at)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Ver conversación — neutro, siempre visible */}
                    <button
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      onClick={() => handleViewConversation(ticket)}
                    >
                      <FaEye className="text-gray-400" />
                      Ver conversación
                    </button>
                    {/* Cerrar — solo si open, verde suave */}
                    {ticket.status === 'open' && (
                      <button
                        className="w-full sm:w-auto flex items-center justify-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
                        onClick={() => handleCloseTicket(ticket)}
                      >
                        <FaCheckCircle className="text-emerald-500" />
                        Cerrar
                      </button>
                    )}
                    {/* Archivar — solo si closed, gris suave */}
                    {ticket.status === 'closed' && (
                      <button
                        className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => handleArchiveTicket(ticket)}
                      >
                        <FaArchive className="text-slate-400" />
                        Archivar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            ))}

            {/* Pagination controls (bottom) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={clampedPage <= 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página <span className="font-medium text-gray-800">{clampedPage}</span> / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={clampedPage >= totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Conversation in modal */}
      {selectedTicket && (
        <TicketConversationModal isOpen={true} onClose={handleCloseConversation}>
          {selectedTicket.ticket_type === 'anonymous' ? (
            <AdminAnonymousTicketConversation
              ticket={{
                id: selectedTicket.id,
                ticket_id: selectedTicket.ticket_id || '',
                asunto: selectedTicket.asunto || '',
                mensaje: selectedTicket.mensaje,
                status: selectedTicket.status,
              }}
              onClose={handleCloseConversation}
              onTicketUpdate={() => {
                if (selectedTicket.status !== 'open') loadTickets();
              }}
            />
          ) : (
            <TicketConversation
              ticket={selectedTicket}
              onClose={handleCloseConversation}
              onTicketUpdate={() => {
                if (selectedTicket.status !== 'open') loadTickets();
              }}
            />
          )}
        </TicketConversationModal>
      )}

    </div>
  );
};

export default AdminTicketsDashboard;