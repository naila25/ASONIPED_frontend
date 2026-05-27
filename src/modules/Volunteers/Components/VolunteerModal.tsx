import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { registerForVolunteer, cancelVolunteerRegistration } from '../Services/volunteerRegistrations';
import type { VolunteerOption } from '../Types/volunteer';
import { FaTools, FaRegLightbulb, FaRegCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';
import { MdLocationOn, MdDescription } from 'react-icons/md';
import { getToken } from '../../Login/Services/auth';
import { formatTime12Hour } from '../../../shared/Utils/timeUtils';
import { getAPIBaseURLSync } from '../../../shared/Services/config';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: VolunteerOption;
}

const VolunteerModal = ({ isOpen, onClose, volunteer }: VolunteerModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({
    is_registered: volunteer.is_registered || false,
    available_spots: volunteer.available_spots || volunteer.spots || 0,
    registered_count: volunteer.registered_count || 0,
  });

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

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(Boolean(token));

    if (isOpen) {
      setRegistrationStatus({
        is_registered: volunteer.is_registered || false,
        available_spots: volunteer.available_spots || volunteer.spots || 0,
        registered_count: volunteer.registered_count || 0,
      });
      setJustRegistered(false);
    }
  }, [isOpen, volunteer.is_registered, volunteer.available_spots, volunteer.spots, volunteer.registered_count]);

  const handleRegister = async () => {
    if (submitting) return;

    const token = getToken();

    if (!isAuthenticated || !token) {
      window.location.href = '/admin/login';
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
    } catch (error) {
      console.error('Error registering:', error);
      const message = error instanceof Error ? error.message : 'Error al registrarse';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (submitting) return;

    if (!window.confirm('¿Estás seguro de que quieres cancelar tu inscripción?')) {
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
    } catch (error) {
      console.error('Error unregistering:', error);
      const message = error instanceof Error ? error.message : 'Error al cancelar tu inscripción';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayImageUrl = volunteer.imageUrl?.startsWith('http')
    ? volunteer.imageUrl
    : `${getAPIBaseURLSync()}${volunteer.imageUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="box-border w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-lg bg-white shadow-lg">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 min-w-0">
              <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">{volunteer.title}</h2>
              <button onClick={onClose} className="flex-shrink-0 text-gray-700 hover:text-gray-800">
                ✕
              </button>
            </div>

            <img src={displayImageUrl} alt={volunteer.title} className="h-48 w-full rounded object-cover" />

            <div>
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <MdDescription className="text-orange-500" />
                Descripción del voluntariado:
              </span>
              <p className="line-clamp-4 text-neutral-700">{volunteer.description}</p>
            </div>

            <div>
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <FaRegLightbulb className="text-orange-500" />
                Habilidades necesarias:
              </span>
              <p className="line-clamp-4 text-neutral-700">{(volunteer as VolunteerOption & { skills?: string }).skills || '—'}</p>
            </div>

            <div>
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <FaTools className="text-orange-500" />
                Herramientas necesarias:
              </span>
              <p className="line-clamp-4 text-neutral-700">{(volunteer as VolunteerOption & { tools?: string }).tools || '—'}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-neutral-700 md:grid-cols-2">
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

              <div className="flex min-w-0 items-center gap-2">
                <MdLocationOn className="flex-shrink-0 text-orange-500" />
                <span className="flex-shrink-0 font-medium text-gray-900">Ubicación:</span>
                <span className="truncate">{volunteer.location}</span>
              </div>

              {registrationStatus.available_spots !== undefined && (
                <div className="flex items-center gap-2">
                  <FaUsers className="text-orange-500" />
                  <span className="font-medium text-gray-900">Cupos:</span>
                  <span className={registrationStatus.available_spots > 0 ? 'text-green-600' : 'text-red-600'}>
                    {registrationStatus.available_spots} disponibles
                  </span>
                  {registrationStatus.registered_count > 0 && (
                    <span className="text-sm text-gray-500">({registrationStatus.registered_count} registrados)</span>
                  )}
                </div>
              )}
            </div>

            {!isAuthenticated && !registrationStatus.is_registered && (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                Debes iniciar sesión para registrarte.
                <a href="/admin/login" className="ml-1 font-medium underline">
                  Iniciar sesión
                </a>
              </div>
            )}

            <div className="flex flex-col items-center justify-center gap-3">
              {registrationStatus.is_registered && !justRegistered && isAuthenticated && (
                <p
                  className="w-full max-w-md rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700"
                  role="status"
                >
                  Ya estás inscrito en este voluntariado.
                </p>
              )}

              {justRegistered ? (
                <div className="space-y-3 text-center">
                  <div className="mb-2 font-semibold text-green-600">¡Te has inscrito exitosamente!</div>
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                      to="/user/voluntariado"
                      className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-2 text-white transition hover:bg-orange-500"
                    >
                      Ir a Mi Voluntariado
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={registrationStatus.is_registered ? handleUnregister : handleRegister}
                  disabled={submitting || !isAuthenticated}
                  className={`rounded-lg px-6 py-2 transition disabled:opacity-50 ${
                    registrationStatus.is_registered
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : registrationStatus.available_spots === 0
                      ? 'cursor-not-allowed bg-gray-400 text-white'
                      : isAuthenticated
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  {submitting
                    ? 'Procesando...'
                    : registrationStatus.is_registered
                    ? 'Cancelar Inscripción'
                    : registrationStatus.available_spots === 0
                    ? 'Sin Cupos Disponibles'
                    : isAuthenticated
                    ? 'Registrarse'
                    : 'Iniciar Sesión para Registrarse'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerModal;
