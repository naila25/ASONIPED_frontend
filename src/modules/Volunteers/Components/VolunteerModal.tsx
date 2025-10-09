import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { registerForVolunteer, cancelVolunteerRegistration } from '../Services/volunteerRegistrations';
import type { VolunteerOption } from '../Types/volunteer';
import { FaTools, FaRegLightbulb, FaRegCalendarAlt, FaClock, FaUsers } from "react-icons/fa";   
import { MdLocationOn, MdDescription } from "react-icons/md";  
import { getToken } from '../../Login/Services/auth';
import { formatTime12Hour } from '../../../shared/Utils/timeUtils';

// Modal for displaying volunteer opportunity details and registration form
interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: VolunteerOption;
}

const VolunteerModal = ({ isOpen, onClose, volunteer }: VolunteerModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<{
    is_registered: boolean;
    available_spots: number;
    registered_count: number;
  }>({
    is_registered: volunteer.is_registered || false,
    available_spots: volunteer.available_spots || volunteer.spots || 0,
    registered_count: volunteer.registered_count || 0,
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

  // Detect auth and update registration status when modal opens
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(Boolean(token));
    
    // Update registration status when modal opens
    if (isOpen) {
      setRegistrationStatus({
        is_registered: volunteer.is_registered || false,
        available_spots: volunteer.available_spots || volunteer.spots || 0,
        registered_count: volunteer.registered_count || 0,
      });
      setJustRegistered(false); // Reset just registered state
    }
  }, [isOpen, volunteer.is_registered, volunteer.available_spots, volunteer.spots, volunteer.registered_count]);

  const handleRegister = async () => {
    if (submitting) return;
    
    // Check authentication status
    const token = getToken();
    console.log('Auth check - isAuthenticated:', isAuthenticated, 'token exists:', !!token);
    
    if (!isAuthenticated || !token) {
      alert('Debes iniciar sesión para registrarte en un voluntariado.');
      return;
    }
    
    try {
      setSubmitting(true);
      const result = await registerForVolunteer(parseInt(volunteer.id));
      
      setRegistrationStatus({
        is_registered: true,
        available_spots: result.available_spots,
        registered_count: result.registered_count,
      });
      
      setJustRegistered(true);
      alert('¡Te has registrado exitosamente para este voluntariado!');
    } catch (error) {
      console.error('Error registering:', error);
      alert(error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (submitting) return;
    
    if (!window.confirm('¿Estás seguro de que quieres cancelar tu registro?')) {
      return;
    }
    
    try {
      setSubmitting(true);
      const result = await cancelVolunteerRegistration(parseInt(volunteer.id));
      
      setRegistrationStatus({
        is_registered: false,
        available_spots: result.available_spots,
        registered_count: result.registered_count,
      });
      
      alert('Tu registro ha sido cancelado exitosamente.');
    } catch (error) {
      console.error('Error unregistering:', error);
      alert(error instanceof Error ? error.message : 'Error al cancelar registro');
    } finally {
      setSubmitting(false);
    }
  };

  // Do not render if modal is not open
  if (!isOpen) return null;

  // Main render: details or registration form
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {(
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold mb-2">{volunteer.title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-700 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <img
                  src={volunteer.imageUrl?.startsWith('http') ? volunteer.imageUrl : `http://localhost:3000${volunteer.imageUrl}`}
                  alt={volunteer.title}
                  className="w-full h-48 object-cover rounded"
                />

                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <MdDescription className="text-orange-500" />
                  Descripción del voluntariado:
                </span>
                <p className="text-neutral-700">{volunteer.description}</p>

                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <FaRegLightbulb className="text-orange-500" />
                  Habilidades necesarias:
                </span>
                <p className="text-neutral-700">{(volunteer as VolunteerOption & { skills?: string }).skills || '—'}</p>

                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <FaTools className="text-orange-500" />
                  Herramientas necesarias:
                </span>
                <p className="text-neutral-700">{(volunteer as VolunteerOption & { tools?: string }).tools || '—'}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-700">
                  <div className="flex items-center gap-2">
                    <FaRegCalendarAlt className="text-orange-500" />
                    <span className="font-medium text-gray-900">Fecha:</span> {volunteer.date}
                  </div>
                  {volunteer.hour && (
                    <div className="flex items-center gap-2">
                      <FaClock className="text-orange-500" />
                      <span className="font-medium text-gray-900">Hora:</span> {formatTime12Hour(volunteer.hour)}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MdLocationOn className="text-orange-500" />
                    <span className="font-medium text-gray-900">Ubicación:</span> {volunteer.location}
                  </div>
                  {registrationStatus.available_spots !== undefined && (
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-orange-500" />
                      <span className="font-medium text-gray-900">Cupos:</span> 
                      <span className={registrationStatus.available_spots > 0 ? 'text-green-600' : 'text-red-600'}>
                        {registrationStatus.available_spots} disponibles
                      </span>
                      {registrationStatus.registered_count > 0 && (
                        <span className="text-gray-500 text-sm">
                          ({registrationStatus.registered_count} registrados)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Auth notice */}
                {!isAuthenticated && !registrationStatus.is_registered && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 text-sm">
                    Debes iniciar sesión para registrarte. 
                    <a href="/admin/login" className="font-medium underline ml-1">Iniciar sesión</a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  {registrationStatus.is_registered ? (
                    <>
                      <div className="text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md text-sm">
                        {justRegistered 
                          ? '¡Inscripción realizada! Puedes revisar tu estado en "Mi Voluntariado".'
                          : '¡Ya estás registrado para este voluntariado! Puedes cancelar tu registro si lo deseas.'
                        }
                      </div>
                      {justRegistered ? (
                        <Link
                          to="/user/voluntariado"
                          className="inline-flex items-center justify-center bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition"
                        >
                          Ir a Mi Voluntariado
                        </Link>
                      ) : (
                        <button
                          onClick={handleUnregister}
                          disabled={submitting}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition disabled:opacity-50"
                        >
                          {submitting ? 'Cancelando...' : 'Cancelar Registro'}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {registrationStatus.available_spots <= 0 ? (
                        <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md text-sm">
                          No hay cupos disponibles para este voluntariado.
                        </div>
                      ) : (
                        <button
                          onClick={handleRegister}
                          disabled={submitting || !isAuthenticated}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition disabled:opacity-50"
                        >
                          {submitting ? 'Registrando...' : 'Registrarse'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerModal;
