import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { useAddEnrollment } from '../../Utils/workshopService';

interface Props {
  workshopId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FormularioMatricula = ({ workshopId, onSuccess, onCancel }: Props) => {
  const { mutate: addEnrollment, isPending } = useAddEnrollment(); 

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      notes: '',
      workshopId,
    },
    onSubmit: async ({ value }) => {
      addEnrollment(value, {
        onSuccess: () => {
          onSuccess();
          form.reset(); 
        },
        onError: (err: unknown) => {
          alert('Error al enviar el formulario. Intenta de nuevo.');
          console.error(err);
        },
      });
    },
  });

  useEffect(() => {
    form.setFieldValue('workshopId', workshopId);
  }, [workshopId]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
        <h2 className="text-xl font-bold text-center text-orange-600 mb-4">
          Matricular al Taller
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) => !value ? 'Nombre requerido' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block mb-1 font-medium text-gray-700">Nombre completo</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Dixón Gaitán"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Correo requerido'
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? 'Correo inválido'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block mb-1 font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  className="w-full border p-2 rounded"
                  placeholder="correo@ejemplo.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="phone"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Teléfono requerido'
                  : !/^\d{4}-?\d{4}$/.test(value)
                  ? 'Teléfono inválido (ej. 8888-8888)'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block mb-1 font-medium text-gray-700">Teléfono</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="8888-8888"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-sm text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div>
                <label className="block mb-1 font-medium text-gray-700">Notas adicionales (opcional)</label>
                <textarea
                  className="w-full border p-2 rounded"
                  placeholder="Algo que deberíamos saber..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              {isPending ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
