import { useState, useEffect } from 'react';
import VolunteerRegistrationForm from './VolunteerRegistrationForm';
import type { VolunteerOption } from '../Types/volunteer';

// Modal for displaying volunteer opportunity details and registration form
interface VolunteerModalProps {
    isOpen: boolean;
    onClose: () => void;
    volunteer: VolunteerOption;
}

const VolunteerModal = ({ isOpen, onClose, volunteer }: VolunteerModalProps) => {
    // State for showing registration form
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

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

    // Handle successful registration form submission
    const handleFormSubmit = () => {
      setShowRegistrationForm(false);
      onClose();
      alert('¡Registro exitoso! Nos pondremos en contacto contigo pronto.');
    };

    // Do not render if modal is not open
    if (!isOpen) return null;
  
    // Main render: details or registration form
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {!showRegistrationForm ? (
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">{volunteer.title}</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-4">
                                <img
                                    src={volunteer.imageUrl}
                                    alt={volunteer.title}
                                    className="w-full h-48 object-cover rounded"
                                />
                                <p className="text-gray-700">{volunteer.description}</p>
                                <div className="flex gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium text-gray-900">Fecha:</span> {volunteer.date}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900">Ubicación:</span> {volunteer.location}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRegistrationForm(true)}
                                    className="w-full bg-gradient-to-r text-white from-orange-400 to-orange-700 py-3 px-6 rounded-mdtext-sm hover:opacity-80 transition"
                                >
                                    Registrarse como Voluntario
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Registro de Voluntario</h2>
                                <button
                                    onClick={() => setShowRegistrationForm(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <VolunteerRegistrationForm
                                volunteerOptionId={volunteer.id}
                                onSubmit={handleFormSubmit}
                                onCancel={onClose}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerModal;