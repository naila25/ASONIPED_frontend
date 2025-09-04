import React, { useState, useEffect, useMemo } from 'react';
import { getAllTickets, closeTicket, archiveTicket } from '../../Utils/ticketService';
import type { DonationTicket } from '../../Utils/ticketService';
import { closeAnonymousTicket, archiveAnonymousTicket } from '../../Utils/anonymousTicketService';
import { FaTicketAlt, FaClock, FaCheckCircle, FaEye, FaSearch, FaArchive } from 'react-icons/fa';
import TicketConversation from '../Donation/TicketConversation';
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
    const open = ticketsData.filter(t => t.status === 'open').length;
    const closed = ticketsData.filter(t => t.status === 'closed').length;
    const assigned = ticketsData.filter(t => t.assigned_admin_id).length;
    const unassigned = total - assigned;
    const archived = ticketsData.filter(t => t.status === 'archived').length;

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
        setSelectedTicket(prev => prev ? { ...prev, status: 'closed' as const } : null);
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
        setSelectedTicket(prev => prev ? { ...prev, status: 'archived' as const } : null);
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
    const uniqueTickets = tickets.filter((ticket, index, self) => 
      index === self.findIndex(t => t.id === ticket.id)
    );
    
    const filtered = uniqueTickets.filter(ticket => {
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesSearch = searchTerm === '' || 
        ticket.asunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.correo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAssigned = assignedFilter === 'all' || 
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
    const statusConfig = {
      open: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Abierto' },
      closed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Cerrado' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Archivado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

    return (
      <span className={`${config.bg} ${config.text} text-xs px-2 py-1 rounded-full font-medium`}>
        {config.label}
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
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadTickets}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaTicketAlt className="text-orange-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaClock className="text-orange-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Abiertos</p>
              <p className="text-xl font-bold text-orange-600">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Cerrados</p>
              <p className="text-xl font-bold text-green-600">{stats.closed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaArchive className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Archivados</p>
              <p className="text-xl font-bold text-gray-600">{stats.archived}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por asunto, nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'closed' | 'archived')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="open">Abiertos</option>
              <option value="closed">Cerrados</option>
              <option value="archived">Archivados</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="mr-2"
              />
              Mostrar Archivados
            </label>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow border">
            <FaTicketAlt className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron tickets que coincidan con los filtros</p>
          </div>
        ) : (
          filteredTickets.map((ticket: DonationTicket) => (
            <div key={ticket.id}>
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                      {/* Show ticket type badge */}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        ticket.ticket_type === 'anonymous' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ticket.ticket_type === 'anonymous' ? 'Anónimo' : 'Registrado'}
                      </span>
                      {/* Show public ticket ID for anonymous tickets */}
                      {ticket.ticket_type === 'anonymous' && ticket.ticket_id && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                          ID: {ticket.ticket_id}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {ticket.ticket_type === 'anonymous' ? (
                        <>
                          <p><strong>Tipo:</strong> Usuario Anónimo</p>
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
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      onClick={() => handleViewConversation(ticket)}
                    >
                      <FaEye />
                      Ver conversación
                    </button>
                    {ticket.status === 'open' && (
                      <button
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        onClick={() => handleCloseTicket(ticket)}
                      >
                        <FaCheckCircle />
                        Cerrar
                      </button>
                    )}
                    {ticket.status === 'closed' && (
                      <button
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        onClick={() => handleArchiveTicket(ticket)}
                      >
                        <FaArchive />
                        Archivar
                      </button>
                    )}
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
