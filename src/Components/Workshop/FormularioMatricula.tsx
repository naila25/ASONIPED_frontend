import { useForm } from '@tanstack/react-form';

interface WorkshopFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: string;
  };
  workshopSelection: {
    workshop: string;
    days: string[];
    timeSlot: string;
  };
  objectives: {
    personalGoals: string;
    motivation: string;
  };
}

const FormularioMatricula = () => {
  const form = useForm<WorkshopFormData>({
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
      },
      workshopSelection: {
        workshop: '',
        days: [],
        timeSlot: '',
      },
      objectives: {
        personalGoals: '',
        motivation: '',
      },
    },
    onSubmit: async ({ value }) => {
      try {
        // Here you would typically send the data to your backend
        console.log('Form submitted:', value);
        alert('Registro enviado con éxito');
        form.reset();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error al enviar el registro');
      }
    },
  });

  return (
    <section className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Registro de Taller</h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }} className="space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Información Personal</h3>
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
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    {field.state.meta.errors && (
                      <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
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
                    <label className="block text-sm font-medium mb-1">Apellido</label>
                    <input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    {field.state.meta.errors && (
                      <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
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
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    {field.state.meta.errors && (
                      <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
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
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    {field.state.meta.errors && (
                      <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
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
                    if (isNaN(age) || age < 5) return 'Debe ser mayor de 5 años';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">Edad</label>
                    <input
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      min="5"
                    />
                    {field.state.meta.errors && (
                      <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* Workshop Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Selección de Taller</h3>
            
            <form.Field
              name="workshopSelection.workshop"
              validators={{
                onChange: ({ value }) => 
                  !value ? 'Debe seleccionar un taller' : undefined,
              }}
            >
              {(field) => (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Taller</label>
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Seleccione un taller</option>
                    <option value="trabajo-social">Trabajo Social</option>
                    <option value="medio-ambiente">Medio Ambiente</option>
                    <option value="terapia-ocupacional">Terapia Ocupacional</option>
                    <option value="agricultura">Agricultura</option>
                    <option value="canva">Canva</option>
                    <option value="deportes">Deportes</option>
                    <option value="cocina">Cocina</option>
                    <option value="artes-industriales">Artes Industriales</option>
                  </select>
                  {field.state.meta.errors && (
                    <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="workshopSelection.days"
              validators={{
                onChange: ({ value }) => 
                  value.length === 0 ? 'Seleccione al menos un día' : undefined,
              }}
            >
              {(field) => (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Días disponibles</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.state.value.includes(day)}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...field.state.value, day]
                              : field.state.value.filter(d => d !== day);
                            field.handleChange(newValue);
                          }}
                          className="rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                  {field.state.meta.errors && (
                    <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="workshopSelection.timeSlot"
              validators={{
                onChange: ({ value }) => 
                  !value ? 'Debe seleccionar un horario' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium mb-1">Horario preferido</label>
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Seleccione un horario</option>
                    <option value="morning">Mañana (8:00 - 12:00)</option>
                    <option value="afternoon">Tarde (12:00 - 16:00)</option>
                    <option value="evening">Noche (16:00 - 20:00)</option>
                  </select>
                  {field.state.meta.errors && (
                    <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Objectives and Interests */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Objetivos e Intereses</h3>
            
            <form.Field
              name="objectives.personalGoals"
              validators={{
                onChange: ({ value }) => 
                  !value ? 'Los objetivos son requeridos' : undefined,
              }}
            >
              {(field) => (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Objetivos personales</label>
                  <textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                    rows={3}
                    placeholder="¿Qué esperas lograr con este taller?"
                  />
                  {field.state.meta.errors && (
                    <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="objectives.motivation"
              validators={{
                onChange: ({ value }) => 
                  !value ? 'La motivación es requerida' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium mb-1">Motivación</label>
                  <textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                    rows={3}
                    placeholder="¿Por qué quieres participar en este taller?"
                  />
                  {field.state.meta.errors && (
                    <span className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</span>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => form.reset()}
              className="px-6 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Enviar Registro
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default FormularioMatricula;