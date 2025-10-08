import { useState, useEffect } from 'react';
import type { Workshop } from "../Types/workshop";
import { FaCalendarAlt, FaClock, FaUsers, FaTools, FaRegLightbulb } from "react-icons/fa";
import { MdLocationOn, MdDescription } from "react-icons/md";
import { registerForWorkshop, cancelWorkshopEnrollment, getAvailableSpots } from '../Services/workshopEnrollments';
import { getToken } from '../../Login/Services/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workshop: Workshop | null;
  onEnroll?: (workshop: Workshop) => void;
}

export const WorkshopDetailsModal = ({ isOpen, onClose, workshop, onEnroll }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [justEnrolled, setJustEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    is_enrolled: boolean;
    available_spots: number;
    enrolled_count: number;
  }>({
    is_enrolled: workshop?.is_enrolled || false,
    available_spots: workshop?.available_spots || workshop?.capacidad || 0,
    enrolled_count: workshop?.enrolled_count || 0,
  });

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Detect auth and update enrollment status when modal opens
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);

    if (token && isOpen && workshop?.id) {
      // Fetch current enrollment status
      fetchEnrollmentStatus();
    }
  }, [isOpen, workshop?.id]);

  const fetchEnrollmentStatus = async () => {
    if (!workshop?.id) return;
    
    try {
      const spots = await getAvailableSpots(workshop.id);
      setEnrollmentStatus({
        is_enrolled: workshop.is_enrolled || false,
        available_spots: spots.available_spots,
        enrolled_count: spots.enrolled_count,
      });
    } catch (error) {
      console.error('Error fetching enrollment status:', error);
    }
  };

  const handleEnroll = async () => {
    if (!workshop?.id) return;
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }

    setSubmitting(true);
    try {
      if (enrollmentStatus.is_enrolled) {
        await cancelWorkshopEnrollment(workshop.id);
        setEnrollmentStatus(prev => ({
          ...prev,
          is_enrolled: false,
          available_spots: prev.available_spots + 1,
          enrolled_count: prev.enrolled_count - 1,
        }));
      } else {
        await registerForWorkshop(workshop.id);
        setEnrollmentStatus(prev => ({
          ...prev,
          is_enrolled: true,
          available_spots: prev.available_spots - 1,
          enrolled_count: prev.enrolled_count + 1,
        }));
        setJustEnrolled(true);
      }
    } catch (error: any) {
      alert(error.message || 'Error al procesar la inscripción');
    } finally {
      setSubmitting(false);
    }
  };


  // Do not render if modal is not open or workshop is null
  if (!isOpen || !workshop) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold mb-2">{workshop.titulo}</h2>
            <button
              onClick={onClose}
              className="text-gray-700 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <img
              src={(() => {
                const originalUrl = workshop.imagen;
                if (!originalUrl) return '';
                if (originalUrl.startsWith('blob:')) return '';
                if (originalUrl.startsWith('http')) return originalUrl;
                return `http://localhost:3000${originalUrl}`;
              })()}
              alt={workshop.titulo}
              className="w-full h-48 object-cover rounded"
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
            {/* Placeholder div - shown when no image or image fails to load */}
            <div className={`w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded image-placeholder ${workshop.imagen && !workshop.imagen.startsWith('blob:') ? 'hidden' : ''}`}>
              <span>Imagen no disponible</span>
            </div>

            <span className="font-medium text-gray-900 flex items-center gap-2">
              <MdDescription className="text-orange-500" />
              Descripción del taller:
            </span>
            <p className="text-neutral-700">{workshop.descripcion}</p>

            {workshop.aprender && (
              <>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <FaRegLightbulb className="text-orange-500" />
                  ¿Qué aprenderás?
                </span>
                <p className="text-neutral-700">{workshop.aprender}</p>
              </>
            )}

            {workshop.materiales && workshop.materiales.length > 0 && (
              <>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <FaTools className="text-orange-500" />
                  Materiales necesarios:
                </span>
                <div className="text-neutral-700">
                  {Array.isArray(workshop.materiales) ? 
                    workshop.materiales.join(', ') : 
                    workshop.materiales
                  }
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-700">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-orange-500" />
                <span className="font-medium text-gray-900">Fecha:</span> {workshop.fecha || 'Por definir'}
              </div>
              {workshop.hora && (
                <div className="flex items-center gap-2">
                  <FaClock className="text-orange-500" />
                  <span className="font-medium text-gray-900">Hora:</span> {workshop.hora}
                </div>
              )}
              <div className="flex items-center gap-2">
                <MdLocationOn className="text-orange-500" />
                <span className="font-medium text-gray-900">Ubicación:</span> {workshop.ubicacion || 'Por definir'}
              </div>
              {typeof workshop.capacidad === "number" && (
                <div className="flex items-center gap-2">
                  <FaUsers className="text-orange-500" />
                  <span className="font-medium text-gray-900">Capacidad:</span> 
                  <span className="text-green-600">
                    {workshop.capacidad} personas
                  </span>
                </div>
              )}
            </div>

            {/* Enrollment Status */}
            {enrollmentStatus.available_spots !== undefined && (
              <div className="text-center text-sm text-gray-600">
                <span className="flex items-center justify-center gap-2">
                  <FaUsers className="text-orange-500" />
                  {enrollmentStatus.enrolled_count} de {workshop.capacidad} inscritos
                  {enrollmentStatus.available_spots > 0 && (
                    <span className="text-green-600">({enrollmentStatus.available_spots} disponibles)</span>
                  )}
                  {enrollmentStatus.available_spots === 0 && (
                    <span className="text-red-600">(Sin cupos disponibles)</span>
                  )}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center items-center">
              {justEnrolled ? (
                <div className="text-center">
                  <div className="text-green-600 font-semibold mb-2">¡Te has inscrito exitosamente!</div>
                  <button
                    onClick={() => setJustEnrolled(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Continuar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={submitting || (!isAuthenticated && enrollmentStatus.available_spots === 0)}
                  className={`px-6 py-2 rounded-lg transition disabled:opacity-50 ${
                    enrollmentStatus.is_enrolled
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : enrollmentStatus.available_spots === 0
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : isAuthenticated
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  {submitting ? (
                    'Procesando...'
                  ) : enrollmentStatus.is_enrolled ? (
                    'Cancelar Inscripción'
                  ) : !isAuthenticated ? (
                    'Iniciar Sesión para Inscribirse'
                  ) : enrollmentStatus.available_spots === 0 ? (
                    'Sin Cupos Disponibles'
                  ) : (
                    'Inscribirse'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetailsModal;
