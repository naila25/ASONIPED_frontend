import React, { useState, useEffect } from 'react';
import { getAllTickets, closeTicket } from '../../Utils/ticketService';
import type { DonationTicket } from '../../Utils/ticketService';
import { useAuth } from '../../Utils/useAuth';
import { FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaUser, FaFilter, FaSearch } from 'react-icons/fa';
import TicketConversation from '../Donation/TicketConversation';

interface AdminTicketsDashboardProps {
  // Props if needed
}

const AdminTicketsDashboard: React.FC<AdminTicketsDashboardProps> = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<DonationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<DonationTicket | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    assigned: 0,
    unassigned: 0
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await getAllTickets();
      setTickets(ticketsData);
      calculateStats(ticketsData);
    } catch (error) {
      setError('Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsData: DonationTicket[]) => {
    const total = ticketsData.length;
    const open = ticketsData.filter(t => t.status === 'open').length;
    const closed = ticketsData.filter(t => t.status === 'closed').length;
    const assigned = ticketsData.filter(t => t.assigned_admin_id).length;
    const unassigned = total - assigned;

    setStats({ total, open, closed, assigned, unassigned });
  };

  const handleCloseTicket = async (ticketId: number) => {
    try {
      await closeTicket(ticketId);
      await loadTickets(); // Reload tickets
    } catch (error) {
      setError('Error closing ticket');
    }
  };

  const handleViewConversation = (ticket: DonationTicket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseConversation = () => {
    setSelectedTicket(null);
    loadTickets(); // Reload tickets to update states
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      ticket.asunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.correo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssigned = assignedFilter === 'all' || 
      (assignedFilter === 'assigned' && ticket.assigned_admin_id) ||
      (assignedFilter === 'unassigned' && !ticket.assigned_admin_id);

    return matchesStatus && matchesSearch && matchesAssigned;
  });

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
    return status === 'open' ? (
      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
        Open
      </span>
    ) : (
      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
        Closed
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Donation Tickets Management</h1>
          <p className="text-gray-600">Manage and respond to donation requests</p>
        </div>
      </div>

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
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-xl font-bold text-orange-600">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-xl font-bold text-green-600">{stats.closed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaUser className="text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-xl font-bold text-blue-600">{stats.assigned}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Unassigned</p>
              <p className="text-xl font-bold text-red-600">{stats.unassigned}</p>
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
                placeholder="Search by subject, name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All assignments</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow border">
            <FaTicketAlt className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No tickets found matching the filters</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Requester:</strong> {ticket.nombre} ({ticket.correo})</p>
                    <p><strong>Created:</strong> {formatDate(ticket.created_at)}</p>
                    {ticket.closed_at && (
                      <p><strong>Closed:</strong> {formatDate(ticket.closed_at)}</p>
                    )}
                    {ticket.admin_name ? (
                      <p><strong>Assigned to:</strong> {ticket.admin_name}</p>
                    ) : (
                      <p className="text-orange-600"><strong>Unassigned</strong></p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={() => handleViewConversation(ticket)}
                  >
                    <FaEye />
                    View conversation
                  </button>
                  {ticket.status === 'open' && (
                    <button
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      onClick={() => handleCloseTicket(ticket.id)}
                    >
                      <FaCheckCircle />
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Conversation modal */}
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

export default AdminTicketsDashboard;
