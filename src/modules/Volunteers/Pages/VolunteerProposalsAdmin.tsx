import { useEffect, useState } from 'react';
import { adminFetchAllProposals, adminSetProposalStatus } from '../Services/fetchVolunteers';
import { API_BASE_URL } from '../../../shared/Services/config';
import { 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface VolunteerProposal {
  id: number;
  user_id: number;
  title: string;
  proposal: string;
  location: string;
  date: string;
  tools?: string;
  document_path?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  full_name?: string;
  email?: string;
}

export default function VolunteerProposalsAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<VolunteerProposal[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminFetchAllProposals();
      setProposals(res.proposals || []);
      setError(null);
    } catch (e) {
      setError('No se pudieron cargar las propuestas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSetStatus = async (id: number, status: 'approved' | 'rejected' | 'filed') => {
    try {
      setUpdatingId(id);
      await adminSetProposalStatus(id, status);
      await load();
    } catch (e) {
      alert('No se pudo actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'filed':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'filed':
        return 'Archivada';
      default:
        return 'Pendiente';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case 'filed':
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Filtered list (hide archived unless toggled on)
  const filteredProposals = proposals.filter((p) => {
    const archived = p.status === 'filed' || (p.admin_note?.includes('[ARCHIVED]') ?? false);
    return showArchived ? true : !archived;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-orange-100 rounded-xl">
            <MessageSquare className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Propuestas de Voluntariado</h1>
            <p className="text-gray-600 mt-1">Revisa y gestiona las propuestas de voluntariado enviadas</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {showArchived ? 'Mostrando archivadas' : 'Archivadas ocultas'}
          </div>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {showArchived ? 'Ocultar archivadas' : 'Mostrar archivadas'}
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{filteredProposals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredProposals.filter(p => p.status === 'pending' || !p.status).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredProposals.filter(p => p.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredProposals.filter(p => p.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-gray-600">Cargando propuestas...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay propuestas</h3>
          <p className="text-gray-600">No se han enviado propuestas de voluntariado aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const isArchived = proposal.status === 'filed' || (proposal.admin_note?.includes('[ARCHIVED]') ?? false);
            const displayStatus = isArchived ? 'filed' : proposal.status;
            return (
            <div key={proposal.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{proposal.title}</h3>
                      <span className={getStatusBadge(displayStatus)}>
                        {getStatusIcon(displayStatus)}
                        {getStatusText(displayStatus)}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {proposal.proposal}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Usuario</p>
                      <p className="text-sm font-medium">
                        {proposal.full_name || `ID: ${proposal.user_id}`}
                      </p>
                      {proposal.email && (
                        <p className="text-xs text-gray-500">{proposal.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Ubicación</p>
                      <p className="text-sm font-medium">{proposal.location || 'No especificada'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha Propuesta</p>
                      <p className="text-sm font-medium">{formatDate(proposal.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Documento</p>
                      {proposal.document_path ? (
                        <a
                          href={proposal.document_path.startsWith('/uploads') ? `${API_BASE_URL}${proposal.document_path}` : proposal.document_path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-3 h-3" />
                          Ver archivo
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Sin archivo</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tools */}
                {proposal.tools && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Herramientas necesarias:</h4>
                    <p className="text-sm text-gray-600">{proposal.tools}</p>
                  </div>
                )}

                {/* Admin Note */}
                {proposal.admin_note && (
                  <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Nota del administrador:</h4>
                    <p className="text-sm text-blue-700">{proposal.admin_note}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onSetStatus(proposal.id, 'approved')}
                    disabled={updatingId === proposal.id || proposal.status === 'approved'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingId === proposal.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Aprobar
                  </button>
                  <button
                    onClick={() => onSetStatus(proposal.id, 'rejected')}
                    disabled={updatingId === proposal.id || proposal.status === 'rejected'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingId === proposal.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Rechazar
                  </button>
                  {proposal.status === 'rejected' && !isArchived && (
                    <button
                      onClick={() => onSetStatus(proposal.id, 'filed')}
                      disabled={updatingId === proposal.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingId === proposal.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      Archivar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}


