import { useEffect, useState } from "react";
import { fetchMyVolunteerEnrollments, fetchMyVolunteerProposals, unenrollFromVolunteerOption, deleteMyProposal } from "../Services/fetchVolunteers";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaUserCheck, FaClock, FaFileAlt, FaDownload, FaTimes } from "react-icons/fa";

interface VolunteerEnrollment {
  volunteer_id: number;
  status: string;
  submission_date: string;
  option_id: number;
  option_title: string;
  option_description: string;
  option_imageUrl?: string;
  option_date?: string;
  option_location?: string;
}

interface VolunteerProposal {
  id: number;
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

export default function VoluntariadoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<VolunteerEnrollment[]>([]);
  const [proposals, setProposals] = useState<VolunteerProposal[]>([]);
  const [deletingEnrollment, setDeletingEnrollment] = useState<number | null>(null);
  const [deletingProposal, setDeletingProposal] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [enrollRes, proposalsRes] = await Promise.all([
        fetchMyVolunteerEnrollments(),
        fetchMyVolunteerProposals()
      ]);
      setEnrollments(enrollRes.enrollments || []);
      setProposals(proposalsRes.proposals || []);
      setError(null);
    } catch {
      setError("No se pudieron cargar tus voluntariados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleUnenroll = async (volunteerId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu inscripción en este voluntariado?')) {
      return;
    }

    try {
      setDeletingEnrollment(volunteerId);
      await unenrollFromVolunteerOption(volunteerId);
      await load(); // Reload data
      alert('Te has desinscrito del voluntariado exitosamente');
    } catch {
      alert('Error al cancelar la inscripción. Inténtalo nuevamente.');
    } finally {
      setDeletingEnrollment(null);
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
    return `http://localhost:3000${documentPath}`;
  };

  const getFileName = (documentPath: string) => {
    if (!documentPath) return '';
    return documentPath.split('/').pop() || 'documento';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">Mi Voluntariado</h1>
        <p className="text-gray-600">Gestiona tus participaciones en programas de voluntariado</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-4 text-gray-600">Cargando tus voluntariados...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : enrollments.length === 0 && proposals.length === 0 ? (
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
        {/* My Enrollments - Only show if there are enrollments */}
        {enrollments.length > 0 && (
          <div className="space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mis Inscripciones</h2>
            {enrollments.map((enrollment) => (
            <div key={enrollment.volunteer_id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                {enrollment.option_imageUrl && (
                  <div className="lg:w-80 h-64 lg:h-auto">
                    <img 
                      src={enrollment.option_imageUrl?.startsWith('http') ? enrollment.option_imageUrl : `http://localhost:3000${enrollment.option_imageUrl}`} 
                      alt={enrollment.option_title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{enrollment.option_title}</h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {cleanDescription(enrollment.option_description)}
                      </p>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
                        {getStatusText(enrollment.status)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    {enrollment.option_date && (
                      <div className="flex items-center text-gray-600">
                        <FaRegCalendarAlt className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Fecha</div>
                          <div className="text-base">{enrollment.option_date}</div>
                        </div>
                      </div>
                    )}
                    
                    {enrollment.option_location && (
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Ubicación</div>
                          <div className="text-base">{enrollment.option_location}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <FaClock className="w-5 h-5 mr-3 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Fecha de inscripción</div>
                        <div className="text-base">
                          {new Date(enrollment.submission_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extra details: skills/tools */}
                  {(enrollment as unknown as { option_skills?: string; option_tools?: string }).option_skills || (enrollment as unknown as { option_skills?: string; option_tools?: string }).option_tools ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {(enrollment as unknown as { option_skills?: string }).option_skills && (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Habilidades necesarias</div>
                          <div className="text-sm text-gray-700 whitespace-pre-line">{(enrollment as unknown as { option_skills?: string }).option_skills}</div>
                        </div>
                      )}
                      {(enrollment as unknown as { option_tools?: string }).option_tools && (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Herramientas necesarias</div>
                          <div className="text-sm text-gray-700 whitespace-pre-line">{(enrollment as unknown as { option_tools?: string }).option_tools}</div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleUnenroll(enrollment.volunteer_id)}
                      disabled={deletingEnrollment === enrollment.volunteer_id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingEnrollment === enrollment.volunteer_id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FaTimes className="w-4 h-4" />
                      )}
                      {deletingEnrollment === enrollment.volunteer_id ? 'Cancelando...' : 'Cancelar Inscripción'}
                    </button>
                  </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
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

