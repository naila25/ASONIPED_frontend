import { useEffect, useState } from "react";
import { fetchMyVolunteerProposals, deleteMyProposal } from "../Services/fetchVolunteers";
import { getUserRegistrations, cancelVolunteerRegistration } from "../Services/volunteerRegistrations";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaUserCheck, FaClock, FaFileAlt, FaDownload, FaTimes, FaUsers, FaClipboardList } from "react-icons/fa";
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
  const [proposalDetailsOpen, setProposalDetailsOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<VolunteerProposal | null>(null);

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
    if (!detailsOpen && !proposalDetailsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailsOpen(false);
        setSelectedRegistration(null);
        setProposalDetailsOpen(false);
        setSelectedProposal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailsOpen, proposalDetailsOpen]);

  const openDetails = (registration: VolunteerRegistration) => {
    setSelectedRegistration(registration);
    setDetailsOpen(true);
  };

  const openProposalDetails = (proposal: VolunteerProposal) => {
    setSelectedProposal(proposal);
    setProposalDetailsOpen(true);
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
    <div className="mx-auto min-w-0 max-w-8xl px-6 py-10">
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
          <div className="w-full min-w-0 max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Voluntariado</p>
                  <h3 className="mt-1 break-words text-lg font-semibold text-gray-900">
                    {selectedRegistration.volunteer_option.title}
                  </h3>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(selectedRegistration.status)}`}>
                  {getStatusText(selectedRegistration.status)}
                </span>
              </div>
            </div>

            <div className="max-h-[70vh] min-w-0 overflow-y-auto overflow-x-hidden px-5 py-4">
              <div className="min-w-0 space-y-3 text-sm text-gray-700">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="shrink-0 text-gray-500">Ubicación</span>
                  <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                    {selectedRegistration.volunteer_option.location || '—'}
                  </span>
                </div>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="shrink-0 text-gray-500">Fecha</span>
                  <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                    {selectedRegistration.volunteer_option.date || '—'}
                  </span>
                </div>
                {selectedRegistration.volunteer_option.hour && (
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="shrink-0 text-gray-500">Hora</span>
                    <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                      {formatTime12Hour(selectedRegistration.volunteer_option.hour)}
                    </span>
                  </div>
                )}
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="shrink-0 text-gray-500">Cupos</span>
                  <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                    {selectedRegistration.volunteer_option.available_spots}/{selectedRegistration.volunteer_option.spots}
                  </span>
                </div>
              </div>

              <div className="mt-4 min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500">Descripción</p>
                <p className="mt-1 min-w-0 max-w-full break-words text-sm text-gray-700">
                  {cleanDescription(selectedRegistration.volunteer_option.description)}
                </p>
              </div>

              {selectedRegistration.notes && (
                <div className="mt-4 min-w-0 rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-500">Notas</p>
                  <p className="mt-1 min-w-0 max-w-full break-words whitespace-pre-wrap text-sm text-gray-700">
                    {selectedRegistration.notes}
                  </p>
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

      {proposalDetailsOpen && selectedProposal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Detalles de la propuesta"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setProposalDetailsOpen(false);
              setSelectedProposal(null);
            }
          }}
        >
          <div className="w-full min-w-0 max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Propuesta</p>
                  <h3 className="mt-1 break-words text-lg font-semibold text-gray-900">
                    {truncateTitle(selectedProposal.title, 28)}
                  </h3>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(selectedProposal.status)}`}>
                  {getStatusText(selectedProposal.status)}
                </span>
              </div>
            </div>

            <div className="max-h-[70vh] min-w-0 overflow-y-auto overflow-x-hidden px-5 py-4">
              <div className="min-w-0 space-y-3 text-sm text-gray-700">
                {selectedProposal.date && (
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="shrink-0 text-gray-500">Fecha propuesta</span>
                    <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                      {selectedProposal.date}
                    </span>
                  </div>
                )}
                {selectedProposal.location && (
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="shrink-0 text-gray-500">Ubicación</span>
                    <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                      {selectedProposal.location}
                    </span>
                  </div>
                )}
                {selectedProposal.hour && (
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="shrink-0 text-gray-500">Hora</span>
                    <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                      {formatTime12Hour(selectedProposal.hour)}
                    </span>
                  </div>
                )}
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="shrink-0 text-gray-500">Fecha de envío</span>
                  <span className="min-w-0 flex-1 break-words text-right font-medium text-gray-900">
                    {new Date(selectedProposal.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-4 min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500">Descripción</p>
                <p className="mt-1 min-w-0 max-w-full break-words text-sm text-gray-700 whitespace-pre-wrap">
                  {(selectedProposal.proposal ?? '').trim() || '—'}
                </p>
              </div>

              {selectedProposal.tools && (
                <div className="mt-4 min-w-0 rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-500">Herramientas necesarias</p>
                  <p className="mt-1 min-w-0 max-w-full whitespace-pre-wrap break-words text-sm text-gray-700">
                    {selectedProposal.tools}
                  </p>
                </div>
              )}

              {selectedProposal.document_path && (
                <div className="mt-4 min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500">Documento</p>
                  <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                    <span className="min-w-0 max-w-full break-words text-sm font-medium text-gray-800">
                      {getFileName(selectedProposal.document_path)}
                    </span>
                    <a
                      href={getFileUrl(selectedProposal.document_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                    >
                      <FaDownload className="h-3.5 w-3.5" />
                      Ver archivo
                    </a>
                  </div>
                </div>
              )}

              {selectedProposal.admin_note && (
                <div className="mt-4 min-w-0 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-800">Nota del administrador</p>
                  <p className="mt-1 min-w-0 max-w-full break-words whitespace-pre-wrap text-sm text-blue-900">
                    {selectedProposal.admin_note}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setProposalDetailsOpen(false);
                  setSelectedProposal(null);
                }}
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
          <div className="mb-10 min-w-0 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mis Registros Activos</h2>
            {registrations.filter(r => r.status === 'registered').map((registration) => (
            <div key={registration.id} className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
              {/* Mobile: compact card */}
              <div className="min-w-0 overflow-x-hidden p-4 md:hidden">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                    {registration.volunteer_option.imageUrl ? (
                      <img
                        src={registration.volunteer_option.imageUrl?.startsWith('http') ? registration.volunteer_option.imageUrl : `${getAPIBaseURLSync()}${registration.volunteer_option.imageUrl}`}
                        alt={registration.volunteer_option.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 basis-0">
                    {/* Column on narrow screens so text uses full width; row from sm+ so badge doesn’t steal flex width */}
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                      <div className="min-w-0 w-full max-w-full sm:flex-1 sm:basis-0">
                        <h3 className="text-base font-semibold leading-snug text-gray-900 [overflow-wrap:anywhere]">
                          {registration.volunteer_option.title}
                        </h3>
                        <p className="mt-1 text-sm leading-snug text-gray-600 [overflow-wrap:anywhere]">
                          {registration.volunteer_option.location || '—'} · {registration.volunteer_option.date || '—'}
                        </p>
                        <p className="mt-2 text-sm leading-snug text-gray-600 [overflow-wrap:anywhere]">
                          {cleanDescription(registration.volunteer_option.description)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold sm:self-auto ${getStatusColor(registration.status)}`}
                      >
                        {getStatusText(registration.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex min-w-0 max-w-full flex-wrap items-center gap-2 text-xs text-gray-600">
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
              <div className="hidden min-w-0 md:flex md:flex-col lg:flex-row">
                {/* Image Section */}
                {registration.volunteer_option.imageUrl && (
                  <div className="h-64 shrink-0 lg:h-auto lg:w-80">
                    <img 
                      src={registration.volunteer_option.imageUrl?.startsWith('http') ? registration.volunteer_option.imageUrl : `${getAPIBaseURLSync()}${registration.volunteer_option.imageUrl}`} 
                      alt={registration.volunteer_option.title} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="min-w-0 flex-1 p-6">
                  <div className="mb-4 flex min-w-0 flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 lg:pr-4">
                      <h3 className="mb-2 break-words text-2xl font-bold text-gray-800">
                        {registration.volunteer_option.title}
                      </h3>
                      <p className="min-w-0 break-words text-base leading-relaxed text-gray-600">
                        {cleanDescription(registration.volunteer_option.description)}
                      </p>
                    </div>
                    <div className="mt-4 shrink-0 lg:mt-0 lg:ml-0">
                      <span className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-3">
                    {registration.volunteer_option.date && (
                      <div className="flex min-w-0 items-start text-gray-600">
                        <FaRegCalendarAlt className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-500">Fecha</div>
                          <div className="break-words text-base">{registration.volunteer_option.date}</div>
                        </div>
                      </div>
                    )}
                    
                    {registration.volunteer_option.location && (
                      <div className="flex min-w-0 items-start text-gray-600">
                        <FaMapMarkerAlt className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-500">Ubicación</div>
                          <div className="break-words text-base">{registration.volunteer_option.location}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex min-w-0 items-start text-gray-600">
                      <FaClock className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-500">
                          {registration.status === 'cancelled' ? 'Fecha de cancelación' : 'Fecha de inscripción'}
                        </div>
                        <div className="break-words text-base">
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
                  <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
                    {registration.volunteer_option.hour && (
                      <div className="flex min-w-0 items-start text-gray-600">
                        <FaClock className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-500">Hora</div>
                          <div className="break-words text-base">{formatTime12Hour(registration.volunteer_option.hour)}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex min-w-0 items-start text-gray-600">
                      <FaUsers className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-500">Cupos disponibles</div>
                        <div className="break-words text-base">
                          <span className={registration.volunteer_option.available_spots > 0 ? 'text-green-600' : 'text-red-600'}>
                            {registration.volunteer_option.available_spots}
                          </span>
                          <span className="ml-1 text-sm text-gray-500">
                            / {registration.volunteer_option.spots} total
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {registration.notes && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="mb-1 text-sm font-medium text-gray-500">Notas</div>
                      <div className="min-w-0 break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {registration.notes}
                      </div>
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
        <div className="mt-12 min-w-0">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Mis Propuestas</h2>
            <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
              {proposals.length} propuesta{proposals.length !== 1 ? 's' : ''} enviada{proposals.length !== 1 ? 's' : ''}
            </span>
          </div>

          {proposals.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center shadow-sm sm:p-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-1 ring-gray-200">
                <FaClipboardList className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">No has enviado propuestas aún</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-600">
                Crea tu primera propuesta de voluntariado para contribuir a la comunidad.
              </p>
              <a
                href="/volunteerCard"
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Ver voluntariados disponibles
              </a>
            </div>
          ) : (
            <div className="min-w-0 space-y-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
                >
                  {/* Mobile: compact card (aligned with Mis Registros Activos) */}
              <div className="min-w-0 overflow-x-hidden p-4 md:hidden">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-orange-600 ring-1 ring-orange-200/70">
                    <FaClipboardList className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1 basis-0">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                      <div className="min-w-0 w-full max-w-full sm:flex-1 sm:basis-0">
                        <h3 className="text-base font-semibold leading-snug text-gray-900 [overflow-wrap:anywhere]">
                          {proposal.title}
                        </h3>
                        <p className="mt-1 text-sm leading-snug text-gray-600 [overflow-wrap:anywhere]">
                          {proposal.location || '—'} · {proposal.date || '—'}
                        </p>
                        <p className="mt-2 text-sm leading-snug text-gray-600 [overflow-wrap:anywhere]">
                          {cleanDescription(proposal.proposal)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold sm:self-auto ${getStatusColor(proposal.status)}`}
                      >
                        {getStatusText(proposal.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex min-w-0 max-w-full flex-wrap items-center gap-2 text-xs text-gray-600">
                          {proposal.hour && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                              <FaClock className="h-3.5 w-3.5 text-gray-400" />
                              {formatTime12Hour(proposal.hour)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
                            <FaRegCalendarAlt className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(proposal.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          {proposal.document_path && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 font-medium text-orange-800">
                              <FaFileAlt className="h-3.5 w-3.5" />
                              Archivo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openProposalDetails(proposal)}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      >
                        Ver detalles
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProposal(proposal.id)}
                        disabled={deletingProposal === proposal.id}
                        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      >
                        {deletingProposal === proposal.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <FaTimes className="h-4 w-4" />
                        )}
                        {deletingProposal === proposal.id ? 'Eliminando...' : 'Cancelar'}
                      </button>
                    </div>
                  </div>

                  {/* Tablet / desktop */}
                  <div className="hidden min-h-0 md:grid md:grid-cols-1 lg:grid-cols-[minmax(0,14rem)_1fr]">
                    <div className="flex min-w-0 flex-row items-center justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-orange-50 via-amber-50/70 to-white px-6 py-4 lg:flex-col lg:justify-center lg:border-b-0 lg:border-r lg:border-gray-100 lg:py-10">
                      <div className="flex min-w-0 items-center gap-4 lg:flex-col lg:gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 ring-1 ring-orange-200/60 lg:h-16 lg:w-16">
                          <FaClipboardList className="h-7 w-7 lg:h-8 lg:w-8" />
                        </div>
                        <span
                          className={`max-w-full break-words rounded-xl px-3 py-1 text-center text-xs font-semibold ${getStatusColor(proposal.status)}`}
                        >
                          {getStatusText(proposal.status)}
                        </span>
                      </div>
                      <p className="min-w-0 max-w-[10rem] break-words text-right text-xs text-gray-500 lg:max-w-none lg:text-center">
                        Enviada el{' '}
                        {new Date(proposal.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="min-w-0 p-6">
                      <div className="mb-4 min-w-0">
                        <h3 className="break-words text-2xl font-bold text-gray-900">{proposal.title}</h3>
                        <p className="mt-2 min-w-0 break-words text-base leading-relaxed text-gray-600">
                          {cleanDescription(proposal.proposal)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
                        {proposal.date && (
                          <div className="flex min-w-0 items-start gap-3 text-gray-600">
                            <FaRegCalendarAlt className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Fecha propuesta
                              </div>
                              <div className="break-words text-base text-gray-900">{proposal.date}</div>
                            </div>
                          </div>
                        )}
                        {proposal.location && (
                          <div className="flex min-w-0 items-start gap-3 text-gray-600">
                            <FaMapMarkerAlt className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Ubicación
                              </div>
                              <div className="break-words text-base text-gray-900">{proposal.location}</div>
                            </div>
                          </div>
                        )}
                        {proposal.hour && (
                          <div className="flex min-w-0 items-start gap-3 text-gray-600">
                            <FaClock className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Hora propuesta
                              </div>
                              <div className="break-words text-base text-gray-900">{formatTime12Hour(proposal.hour)}</div>
                            </div>
                          </div>
                        )}
                        <div className="flex min-w-0 items-start gap-3 text-gray-600">
                          <FaClock className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Fecha de envío
                            </div>
                            <div className="break-words text-base text-gray-900">
                              {new Date(proposal.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {(proposal.tools || proposal.document_path || proposal.admin_note) && (
                        <div className="mt-4 min-w-0 space-y-4 border-t border-gray-100 pt-4">
                          {proposal.tools && (
                            <div className="min-w-0">
                              <h4 className="mb-2 text-sm font-semibold text-gray-800">Herramientas necesarias</h4>
                              <p className="min-w-0 max-w-full break-words rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                                {proposal.tools}
                              </p>
                            </div>
                          )}
                          {proposal.document_path && (
                            <div className="min-w-0">
                              <h4 className="mb-2 text-sm font-semibold text-gray-800">Documento adjunto</h4>
                              <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <FaFileAlt className="h-5 w-5 shrink-0 text-orange-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="break-words text-sm font-medium text-gray-800">
                                    {getFileName(proposal.document_path)}
                                  </p>
                                  <p className="text-xs text-gray-500">Archivo adjunto a la propuesta</p>
                                </div>
                                <a
                                  href={getFileUrl(proposal.document_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                                >
                                  <FaDownload className="h-4 w-4" />
                                  Ver archivo
                                </a>
                              </div>
                            </div>
                          )}
                          {proposal.admin_note && (
                            <div className="min-w-0">
                              <h4 className="mb-2 text-sm font-semibold text-gray-800">Nota del administrador</h4>
                              <p className="min-w-0 break-words rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900 whitespace-pre-wrap">
                                {proposal.admin_note}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteProposal(proposal.id)}
                          disabled={deletingProposal === proposal.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          {deletingProposal === proposal.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <FaTimes className="h-4 w-4" />
                          )}
                          {deletingProposal === proposal.id ? 'Eliminando...' : 'Cancelar propuesta'}
                        </button>
                      </div>
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

