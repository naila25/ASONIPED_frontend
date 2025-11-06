import { useEffect, useState } from "react";
import { getUserEnrollments, cancelWorkshopEnrollment } from "../Services/workshopEnrollments";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaUserCheck, FaClock, FaTools, FaRegLightbulb, FaTimes, FaUsers } from "react-icons/fa";
import { formatTime12Hour } from "../../../shared/Utils/timeUtils";

interface WorkshopEnrollment {
  id: number;
  workshop_id: number;
  status: string;
  enrollment_date: string;
  cancellation_date?: string;
  notes?: string;
  workshop_titulo: string;
  workshop_descripcion: string;
  workshop_ubicacion: string;
  workshop_fecha: string;
  workshop_hora: string;
  workshop_capacidad: number;
  workshop_materiales: string[];
  workshop_aprender: string;
  workshop_imagen: string;
}

export default function UserWorkshopsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<WorkshopEnrollment[]>([]);
  const [cancellingEnrollment, setCancellingEnrollment] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      console.log('Loading user workshop enrollments...');
      const enrollmentsRes = await getUserEnrollments();
      console.log('Enrollments response:', enrollmentsRes);
      setEnrollments(enrollmentsRes || []);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError("No se pudieron cargar tus talleres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Inscrito';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleCancelEnrollment = async (workshopId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu inscripción en este taller?')) {
      return;
    }

    try {
      setCancellingEnrollment(workshopId);
      await cancelWorkshopEnrollment(workshopId);
      await load(); // Reload data
      alert('Tu inscripción ha sido cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      alert(error instanceof Error ? error.message : 'Error al cancelar la inscripción. Inténtalo nuevamente.');
    } finally {
      setCancellingEnrollment(null);
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

  return (
    <div className="max-w-8xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Talleres</h1>
        <p className="text-gray-600">Gestiona tus inscripciones en talleres</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-4 text-gray-600">Cargando tus talleres...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : enrollments.filter(e => e.status === 'enrolled').length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aún no estás inscrito</h3>
          <p className="text-gray-600 mb-4">No tienes talleres registrados en este momento.</p>
          <a 
            href="/talleres-publicos" 
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition"
          >
            Ver Talleres Disponibles
          </a>
        </div>
      ) : (
        <>
        {/* My Active Enrollments - Only show if there are active enrollments */}
        {enrollments.filter(e => e.status === 'enrolled').length > 0 && (
          <div className="space-y-6 mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mis Inscripciones Activas</h2>
            {enrollments.filter(e => e.status === 'enrolled').map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                {enrollment.workshop_imagen && (
                  <div className="lg:w-80 h-64 lg:h-auto relative">
                    <img 
                      src={(() => {
                        const originalUrl = enrollment.workshop_imagen;
                        if (!originalUrl) return '';
                        if (originalUrl.startsWith('blob:')) return '';
                        if (originalUrl.startsWith('http')) return originalUrl;
                        return `http://localhost:3000${originalUrl}`;
                      })()}
                      alt={enrollment.workshop_titulo} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                        if (placeholder) placeholder.classList.remove('hidden');
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                        if (placeholder) placeholder.classList.add('hidden');
                      }}
                    />
                    <div className={`absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm image-placeholder ${enrollment.workshop_imagen && !enrollment.workshop_imagen.startsWith('blob:') ? 'hidden' : ''}`}>
                      <span>Imagen no disponible</span>
                    </div>
                  </div>
                )}
                
                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{enrollment.workshop_titulo}</h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {cleanDescription(enrollment.workshop_descripcion)}
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
                    {enrollment.workshop_fecha && (
                      <div className="flex items-center text-gray-600">
                        <FaRegCalendarAlt className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Fecha</div>
                          <div className="text-base">{(() => {
                            try {
                              // Handle DD/MM/YYYY format (already correct)
                              if (enrollment.workshop_fecha.includes('/')) {
                                return enrollment.workshop_fecha;
                              }
                              // Handle ISO format and convert to DD/MM/YYYY
                              const date = new Date(enrollment.workshop_fecha);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('es-ES');
                              }
                              return enrollment.workshop_fecha;
                            } catch (error) {
                              return enrollment.workshop_fecha;
                            }
                          })()}</div>
                        </div>
                      </div>
                    )}
                    
                    {enrollment.workshop_ubicacion && (
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Ubicación</div>
                          <div className="text-base">{enrollment.workshop_ubicacion}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <FaClock className="w-5 h-5 mr-3 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">
                          {enrollment.status === 'cancelled' ? 'Fecha de cancelación' : 'Fecha de inscripción'}
                        </div>
                        <div className="text-base">
                          {new Date(enrollment.status === 'cancelled' ? enrollment.cancellation_date! : enrollment.enrollment_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hour and Capacity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {enrollment.workshop_hora && (
                      <div className="flex items-center text-gray-600">
                        <FaClock className="w-5 h-5 mr-3 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Hora</div>
                          <div className="text-base">{formatTime12Hour(enrollment.workshop_hora)}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="w-5 h-5 mr-3 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">Capacidad</div>
                        <div className="text-base">{enrollment.workshop_capacidad} participantes</div>
                      </div>
                    </div>
                  </div>

                  {/* Materials and Learning */}
                  {(enrollment.workshop_materiales && enrollment.workshop_materiales.length > 0) || enrollment.workshop_aprender ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {enrollment.workshop_materiales && enrollment.workshop_materiales.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FaTools className="w-4 h-4 mr-2 text-orange-500" />
                            Materiales necesarios:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {enrollment.workshop_materiales.map((material, index) => (
                              <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                {material}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {enrollment.workshop_aprender && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FaRegLightbulb className="w-4 h-4 mr-2 text-orange-500" />
                            Qué aprenderás:
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{enrollment.workshop_aprender}</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Notes */}
                  {enrollment.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-500 mb-1">Notas</div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{enrollment.notes}</div>
                    </div>
                  )}

                  {/* Action Button - Only show for enrolled status */}
                  {enrollment.status === 'enrolled' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCancelEnrollment(enrollment.workshop_id)}
                        disabled={cancellingEnrollment === enrollment.workshop_id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingEnrollment === enrollment.workshop_id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <FaTimes className="w-4 h-4" />
                        )}
                        {cancellingEnrollment === enrollment.workshop_id ? 'Cancelando...' : 'Cancelar Inscripción'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
        </>
      )}
    </div>
  );
}