import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { enrollIntoVolunteerOption } from '../Services/fetchVolunteers';
import type { VolunteerOption } from '../Types/volunteer';
import { FaTools, FaRegLightbulb, FaRegCalendarAlt } from "react-icons/fa";   
import { MdLocationOn, MdDescription } from "react-icons/md";  
import { getToken } from '../../Login/Services/auth';

// Modal for displaying volunteer opportunity details and registration form
interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: VolunteerOption;
}

const VolunteerModal = ({ isOpen, onClose, volunteer }: VolunteerModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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

  // Detect auth
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(Boolean(token));
  }, [isOpen]);

  const handleEnroll = async () => {
    if (submitting) return;
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para inscribirte en un voluntariado.');
      return;
    }
    try {
      setSubmitting(true);
      await enrollIntoVolunteerOption(volunteer.id);
      setEnrolled(true);
    } catch (e) {
      alert('No se pudo completar la inscripción. Inténtalo nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Do not render if modal is not open
  if (!isOpen) return null;

  // Main render: details or registration form
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                <p className="text-neutral-700">{(volunteer as any).skills || '—'}</p>

                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <FaTools className="text-orange-500" />
                  Herramientas necesarias:
                </span>
                <p className="text-neutral-700">{(volunteer as any).tools || '—'}</p>

                <div className="flex gap-4 text-neutral-700">
                  <div className="flex items-center gap-2">
                    <FaRegCalendarAlt className="text-orange-500" />
                    <span className="font-medium text-gray-900">Fecha:</span> {volunteer.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MdLocationOn className="text-orange-500" />
                    <span className="font-medium text-gray-900">Ubicación:</span> {volunteer.location}
                  </div>
                </div>

                {/* Auth notice */}
                {!isAuthenticated && !enrolled && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 text-sm">
                    Debes iniciar sesión para inscribirte. 
                    <a href="/admin/login" className="font-medium underline ml-1">Iniciar sesión</a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  {!enrolled ? (
                    <button
                      onClick={handleEnroll}
                      disabled={submitting || !isAuthenticated}
                      className="bg-orange-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition"
                    >
                      {submitting ? 'Inscribiendo...' : 'Inscribirse como Voluntario'}
                    </button>
                  ) : (
                    <>
                      <div className="text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md text-sm">
                        ¡Inscripción realizada! Puedes revisar tu estado en "Mi Voluntariado".
                      </div>
                      <Link
                        to="/user/voluntariado"
                        className="inline-flex items-center justify-center bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition"
                      >
                        Ir a Mi Voluntariado
                      </Link>
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
