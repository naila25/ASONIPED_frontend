import { useForm } from '@tanstack/react-form'
import { addVolunteer } from '../Services/fetchVolunteers'
import { useState } from 'react'

// Props for the volunteer registration form
interface VolunteerRegistrationFormProps {
  volunteerOptionId: string;
  onSubmit: (formData: VolunteerFormData) => void;
  onCancel: () => void;
}

// Data structure for the volunteer registration form
interface VolunteerFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: string;
  };
  availability: {
    days: string[];
    timeSlots: string[];
  };
  interests: string[];
  skills: string;
  motivation: string;
}

// Volunteer registration form component
const VolunteerRegistrationForm = ({
  volunteerOptionId,
  onSubmit,
  onCancel
}: VolunteerRegistrationFormProps) => {
  // State for submission status
  const [submitting, setSubmitting] = useState(false);

  // Form setup and submission logic
  const form = useForm<VolunteerFormData>({
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
      },
      availability: {
        days: [],
        timeSlots: [],
      },
      interests: [],
      skills: '',
      motivation: '',
    },
    onSubmit: async ({ value }) => {
      if (submitting) return;
      setSubmitting(true);
      // Prepare payload for backend
      const volunteerPayload = {
        first_name: value.personalInfo.firstName,
        last_name: value.personalInfo.lastName,
        email: value.personalInfo.email,
        phone: value.personalInfo.phone,
        age: value.personalInfo.age,
        availability_days: value.availability.days.join(','),
        availability_time_slots: value.availability.timeSlots.join(','),
        interests: value.interests.join(','),
        skills: value.skills,
        motivation: value.motivation,
        volunteer_option_id: volunteerOptionId,
      };
      await addVolunteer(volunteerPayload);
      setSubmitting(false);
      onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="personalInfo.firstName"
            validators={{
              onChange: ({ value }) => 
                !value ? 'El nombre es requerido' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                {field.state.meta.errors && (
                  <p className="text-red-400 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="personalInfo.lastName"
            validators={{
              onChange: ({ value }) => 
                !value ? 'El apellido es requerido' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                {field.state.meta.errors && (
                  <p className="text-red-500 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="personalInfo.email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'El email es requerido';
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                  return 'Email inválido';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                {field.state.meta.errors && (
                  <p className="text-red-400 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="personalInfo.phone"
            validators={{
              onChange: ({ value }) => 
                !value ? 'El teléfono es requerido' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                {field.state.meta.errors && (
                  <p className="text-red-400 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="personalInfo.age"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'La edad es requerida';
                const age = parseInt(value);
                if (isNaN(age) || age < 16) return 'Debe ser mayor de 16 años';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
                  min="16"
                />
                {field.state.meta.errors && (
                  <p className="text-red-400 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-lg font-medium mb-4">Disponibilidad</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => (
            <form.Field
              key={day}
              name="availability.days"
              validators={{
                onChange: ({ value }) => 
                  value.length === 0 ? 'Seleccione al menos un día' : undefined,
              }}
            >
              {(field) => (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={field.state.value.includes(day)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...field.state.value, day]
                        : field.state.value.filter(d => d !== day);
                      field.handleChange(newValue);
                    }}
                    className="rounded text-orange-400 focus:ring-orange-400"
                  />
                  <span className="text-sm">{day}</span>
                </label>
              )}
            </form.Field>
          ))}
        </div>

        <form.Field
          name="availability.timeSlots"
          validators={{
            onChange: ({ value }) => 
              value.length === 0 ? 'Seleccione un horario' : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium mb-1">
                Horario Preferido
              </label>
              <select
                value={field.state.value[0] || ''}
                onChange={(e) => field.handleChange([e.target.value])}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Seleccione un horario</option>
                <option value="morning">Mañana (8:00 - 12:00)</option>
                <option value="afternoon">Tarde (12:00 - 16:00)</option>
              </select>
              {field.state.meta.errors && (
                <p className="text-red-500 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Skills and Motivation */}
      <div>
        <h3 className="text-lg font-medium mb-4">Habilidades y Motivación</h3>
        
        <form.Field
          name="skills"
          validators={{
            onChange: ({ value }) => 
              !value ? 'Las habilidades son requeridas' : undefined,
          }}
        >
          {(field) => (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Habilidades
              </label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                rows={3}
                placeholder="Describa sus habilidades y experiencia..."
              />
              {field.state.meta.errors && (
                <p className="text-red-500 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="motivation"
          validators={{
            onChange: ({ value }) => 
              !value ? 'La motivación es requerida' : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium mb-1">
                Motivación
              </label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                rows={3}
                placeholder="¿Por qué desea ser voluntario?"
              />
              {field.state.meta.errors && (
                <p className="text-red-500 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          disabled={submitting}
        >
          Enviar Registro
        </button>
      </div>
    </form>
  );
};

export default VolunteerRegistrationForm; 