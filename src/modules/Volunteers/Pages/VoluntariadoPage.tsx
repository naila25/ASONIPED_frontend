import { useEffect, useState } from "react";
import { fetchMyVolunteerProposals, deleteMyProposal } from "../Services/fetchVolunteers";
import { getUserRegistrations, cancelVolunteerRegistration } from "../Services/volunteerRegistrations";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaUserCheck, FaClock, FaFileAlt, FaDownload, FaTimes, FaUsers } from "react-icons/fa";
import { formatTime12Hour } from "../../../shared/Utils/timeUtils";
import { getAPIBaseURLSync } from '../../../shared/Services/config';

interface VolunteerRegistration {
  id: number;
  volunteer_option_id: number;
  status: string;
  registration_date: string;
  cancellation_date?: string;
  notes?: string;
  volunteer_option: {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    hour: string;
    spots: number;
    imageUrl?: string;
    available_spots: number;
    registered_count: number;
  };
}

interface VolunteerProposal {
  id: number;
  title: string;
  proposal: string;
  location: string;
  date: string;
  hour?: string;
  tools?: string;
  document_path?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  full_name?: string;
  email?: string;
}

export default function VoluntariadoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<VolunteerRegistration[]>([]);
  const [proposals, setProposals] = useState<VolunteerProposal[]>([]);
  const [cancellingRegistration, setCancellingRegistration] = useState<number | null>(null);
  const [deletingProposal, setDeletingProposal] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<VolunteerRegistration | null>(null);

  const truncateTitle = (title: string, maxChars = 15) => {
    const t = (title ?? '').trim();
    if (t.length <= maxChars) return t;
    return `${t.slice(0, maxChars)}…`;
  };

  const load = async () => {
    try {
      setLoading(true);
      console.log('Loading user registrations...');
      const [registrationsRes, proposalsRes] = await Promise.all([
        getUserRegistrations(),
        fetchMyVolunteerProposals()
      ]);
      console.log('Registrations response:', registrationsRes);
      console.log('Proposals response:', proposalsRes);
      setRegistrations(registrationsRes || []);
      setProposals(proposalsRes.proposals || []);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError("No se pudieron cargar tus voluntariados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!detailsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailsOpen(false);
        setSelectedRegistration(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailsOpen]);

  const openDetails = (registration: VolunteerRegistration) => {
    setSelectedRegistration(registration);
    setDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Inscrito';
      case 'cancelled': return 'Cancelado';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleCancelRegistration = async (volunteerOptionId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu inscripción en este voluntariado?')) {
      return;
    }

    try {
      setCancellingRegistration(volunteerOptionId);
      await cancelVolunteerRegistration(volunteerOptionId);
      await load(); // Reload data
      alert('Tu inscripción ha sido cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      alert(error instanceof Error ? error.message : 'Error al cancelar la inscripción. Inténtalo nuevamente.');
    } finally {
      setCancellingRegistration(null);
    }
  };

  const handleDeleteProposal = async (proposalId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingProposal(proposalId);
      await deleteMyProposal(proposalId);
      await load(); // Reload data
      alert('Propuesta eliminada exitosamente');
    } catch {
      alert('Error al eliminar la propuesta. Inténtalo nuevamente.');
    } finally {
      setDeletingProposal(null);
    }
  };

  const cleanDescription = (description: string) => {
    if (!description) return 'Descripción no disponible';
    // Remove any code-like content and limit length
    const cleaned = description
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/export.*$/gm, '') // Remove export statements
      .replace(/import.*$/gm, '') // Remove import statements
      .replace(/await.*$/gm, '') // Remove await statements
      .replace(/const.*$/gm, '') // Remove const declarations
      .replace(/function.*$/gm, '') // Remove function declarations
      .replace(/if.*$/gm, '') // Remove if statements
      .replace(/return.*$/gm, '') // Remove return statements
      .replace(/try.*$/gm, '') // Remove try statements
      .replace(/catch.*$/gm, '') // Remove catch statements
      .replace(/\.query\(.*$/gm, '') // Remove query calls
      .replace(/db\./gm, '') // Remove db references
      .replace(/\[.*\]/g, '') // Remove array references
      .replace(/\{.*\}/g, '') // Remove object references
      .replace(/[{}();]/g, '') // Remove brackets and parentheses
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
  };

  const getFileUrl = (documentPath: string) => {
    if (!documentPath) return undefined;
    // If the path already includes the full URL, return as is
    if (documentPath.startsWith('http')) return documentPath;
    // Otherwise, prepend the API base URL
    return `${getAPIBaseURLSync()}${documentPath}`;
  };

  const getFileName = (documentPath: string) => {
    if (!documentPath) return '';
    return documentPath.split('/').pop() || 'documento';
  };

  return (
    <div className="max-w-8xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Voluntariado</h1>
        <p className="text-gray-600">Gestiona tus participaciones en programas de voluntariado</p>
      </div>

      {/* Mobile-only details modal */}
      {detailsOpen && selectedRegistration && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Detalles del voluntariado"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setDetailsOpen(false);
              setSelectedRegistration(null);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Voluntariado</p>
                  <h3 className="mt-1 truncate text-lg font-semibold text-gray-900">
                    {truncateTitle(selectedRegistration.volunteer_option.title, 28)}
                  </h3>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(selectedRegistration.status)}`}>
                  {getStatusText(selectedRegistration.status)}
                </span>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto px-5 py-4">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Ubicación</span>
                  <span className="text-right font-medium text-gray-900">{selectedRegistration.volunteer_option.location || '—'}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Fecha</span>
                  <span className="text-right font-medium text-gray-900">{selectedRegistration.volunteer_option.date || '—'}</span>
                </div>
                {selectedRegistration.volunteer_option.hour && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-500">Hora</span>
                    <span className="text-right font-medium text-gray-900">{formatTime12Hour(selectedRegistration.volunteer_option.hour)}</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Cupos</span>
                  <span className="text-right font-medium text-gray-900">
                    {selectedRegistration.volunteer_option.available_spots}/{selectedRegistration.volunteer_option.spots}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500">Descripción</p>
                <p className="mt-1 text-sm text-gray-700">{cleanDescription(selectedRegistration.volunteer_option.description)}</p>
              </div>

              {selectedRegistration.notes && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-500">Notas</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{selectedRegistration.notes}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => { setDetailsOpen(false); setSelectedRegistration(null); }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-4 text-gray-600">Cargando tus voluntariados...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : registrations.filter(r => r.status === 'registered').length === 0 && proposals.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aún no estás inscrito</h3>
          <p className="text-gray-600 mb-4">No tienes voluntariados registrados en este momento.</p>
          <a 
            href="/volunteerCard" 
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition"
          >
            Ver Voluntariados Disponibles
          </a>
        </div>
      ) : (
        <>
        {/* My Active Registrations - Only show if there are active registrations */}
        {registrations.filter(r => r.status === 'registered').length > 0 && (
          <div className="space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mis Registros Activos</h2>
            {registrations.filter(r => r.status === 'registered').map((registration) => (
            <div key={registration.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Mobile: compact card */}
              <div className="p-4 md:hidden">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                    {registration.volunteer_option.imageUrl ? (
                      <img
                        src={registration.volunteer_option.imageUrl?.startsWith('http') ? registration.volunteer_option.imageUrl : `${getAPIBaseURLSync()}${registration.volunteer_option.imageUrl}`}
                        alt={registration.volunteer_option.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-gray-900">{truncateTitle(registration.volunteer_option.title, 20)}</h3>
                        <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                          {registration.volunteer_option.location || '—'} · {registration.volunteer_option.date || '—'}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      {registration.volunteer_option.hour && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                          <FaClock className="h-3.5 w-3.5 text-gray-400" />
                          {formatTime12Hour(registration.volunteer_option.hour)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                        <FaUsers className="h-3.5 w-3.5 text-gray-400" />
                        {registration.volunteer_option.available_spots}/{registration.volunteer_option.spots}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openDetails(registration)}
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  >
                    Ver detalles
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelRegistration(registration.volunteer_option_id)}
                    disabled={cancellingRegistration === registration.volunteer_option_id}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    {cancellingRegistration === registration.volunteer_option_id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <FaTimes className="h-4 w-4" />
                    )}
                    {cancellingRegistration === registration.volunteer_option_id ? 'Cancelando...' : 'Cancelar'}
                  </button>
                </div>
              </div>

              {/* Desktop: keep current design */}
              <div className="hidden md:flex flex-col lg:flex-row">
                {/* Image Section */}
                {registration.volunteer_option.imageUrl && (
                  <div className="lg:w-80 h-64 lg:h-auto">
                    <img 
                      src={registration.volunteer_option.imageUrl?.startsWith('http') ? registration.volunteer_option.imageUrl : `${getAPIBaseURLSync()}${registration.volunteer_option.imageUrl}`} 
                      alt={registration.volunteer_option.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{registration.volunteer_option.title}</h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {cleanDescription(registration.volunteer_option.description)}
                      </p>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    {registration.volunteer_option.date && (
                      <div className="flex items-center text-gray-600">
                        <FaRegCalendarAlt className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Fecha</div>
                          <div className="text-base">{registration.volunteer_option.date}</div>
                        </div>
                      </div>
                    )}
                    
                    {registration.volunteer_option.location && (
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Ubicación</div>
                          <div className="text-base">{registration.volunteer_option.location}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <FaClock className="w-5 h-5 mr-3 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">
                          {registration.status === 'cancelled' ? 'Fecha de cancelación' : 'Fecha de inscripción'}
                        </div>
                        <div className="text-base">
                          {new Date(registration.status === 'cancelled' ? registration.cancellation_date! : registration.registration_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hour and Spots */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {registration.volunteer_option.hour && (
                      <div className="flex items-center text-gray-600">
                        <FaClock className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Hora</div>
                          <div className="text-base">{formatTime12Hour(registration.volunteer_option.hour)}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="w-5 h-5 mr-3 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Cupos disponibles</div>
                        <div className="text-base">
                          <span className={registration.volunteer_option.available_spots > 0 ? 'text-green-600' : 'text-red-600'}>
                            {registration.volunteer_option.available_spots}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            / {registration.volunteer_option.spots} total
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {registration.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">Notas</div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{registration.notes}</div>
                    </div>
                  )}

                  {/* Action Button - Only show for registered status */}
                  {registration.status === 'registered' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCancelRegistration(registration.volunteer_option_id)}
                        disabled={cancellingRegistration === registration.volunteer_option_id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingRegistration === registration.volunteer_option_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <FaTimes className="w-4 h-4" />
                        )}
                        {cancellingRegistration === registration.volunteer_option_id ? 'Cancelando...' : 'Cancelar Inscripción'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* My Proposals - Always show */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Mis Propuestas</h2>
            <div className="text-sm text-gray-500">
              {proposals.length} propuesta{proposals.length !== 1 ? 's' : ''} enviada{proposals.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {proposals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRegCalendarAlt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No has enviado propuestas aún</h3>
              <p className="text-gray-600 mb-6">Crea tu primera propuesta de voluntariado para contribuir a la comunidad</p>
              <a 
                href="/volunteerCard" 
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Ver voluntariados disponibles
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{proposal.title}</h3>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {cleanDescription(proposal.proposal)}
                        </p>
                      </div>
                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                          {getStatusText(proposal.status)}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      {proposal.date && (
                        <div className="flex items-center text-gray-600">
                          <FaRegCalendarAlt className="w-5 h-5 mr-3 text-orange-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-500">Fecha propuesta</div>
                            <div className="text-base">{proposal.date}</div>
                          </div>
                        </div>
                      )}

                      {proposal.location && (
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="w-5 h-5 mr-3 text-orange-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-500">Ubicación</div>
                            <div className="text-base">{proposal.location}</div>
                          </div>
                        </div>
                      )}

                      {proposal.hour && (
                        <div className="flex items-center text-gray-600">
                          <FaClock className="w-5 h-5 mr-3 text-orange-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-500">Hora propuesta</div>
                            <div className="text-base">{formatTime12Hour(proposal.hour)}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-gray-600">
                        <FaClock className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Fecha de envío</div>
                          <div className="text-base">
                            {new Date(proposal.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tools, File, and Admin Note */}
                    {(proposal.tools || proposal.document_path || proposal.admin_note) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {proposal.tools && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Herramientas necesarias:</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{proposal.tools}</p>
                          </div>
                        )}
                        
                        {proposal.document_path && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Documento adjunto:</h4>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                              <FaFileAlt className="w-5 h-5 text-orange-500" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 font-medium">{getFileName(proposal.document_path)}</p>
                                <p className="text-xs text-gray-500">Archivo adjunto a la propuesta</p>
                              </div>
                              <a
                                href={getFileUrl(proposal.document_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                              >
                                <FaDownload className="w-4 h-4" />
                                Ver archivo
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {proposal.admin_note && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Nota del administrador:</h4>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                              {proposal.admin_note}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleDeleteProposal(proposal.id)}
                        disabled={deletingProposal === proposal.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingProposal === proposal.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <FaTimes className="w-4 h-4" />
                        )}
                        {deletingProposal === proposal.id ? 'Eliminando...' : 'Cancelar Propuesta'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}

