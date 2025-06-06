import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { getAuthHeader, isAuthenticated } from "../../Utils/auth";

const FormularioDonacion = () => {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: "",
      telefono: "",
      correo: "",
      tipo: "Monetaria",
      metodo: "",
      monto: "",
      aceptar: false,
    },
    onSubmit: async ({ value }) => {
      setStatus(null);
      
      if (!isAuthenticated()) {
        setStatus({ type: 'error', message: 'Por favor, inicia sesión para realizar una donación.' });
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/donations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
          },
          body: JSON.stringify(value),
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          }
          throw new Error("Error al guardar la donación");
        }

        setStatus({ type: 'success', message: "Donación enviada con éxito." });
        form.reset();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al enviar la donación. Intenta de nuevo.";
        setStatus({ type: 'error', message: errorMessage });
        console.error("Error al enviar:", err);
      }
    },
  });

  return (
    
    <section className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Formulario de Donación</h2>
        {status && (
          <div className={`mb-4 p-3 rounded text-center ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.message}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
          {/* Nombre */}
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => !value ? "El nombre es requerido" : undefined
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${field.state.meta.errors.length ? 'border-red-500' : ''}`}
                  disabled={form.state.isSubmitting}
                />
                {field.state.meta.errors[0] && <span className="text-red-500 text-xs">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {/* Teléfono */}
          <form.Field
            name="telefono"
            validators={{
              onChange: ({ value }) => !value ? "El teléfono es requerido" : undefined
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${field.state.meta.errors.length ? 'border-red-500' : ''}`}
                  disabled={form.state.isSubmitting}
                />
                {field.state.meta.errors[0] && <span className="text-red-500 text-xs">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {/* Correo */}
          <form.Field
            name="correo"
            validators={{
              onChange: ({ value }) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? "Correo inválido" : undefined
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${field.state.meta.errors.length ? 'border-red-500' : ''}`}
                  disabled={form.state.isSubmitting}
                />
                {field.state.meta.errors[0] && <span className="text-red-500 text-xs">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {/* Tipo de donación */}
          <form.Field name="tipo">
            {(field) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Tipo de donación</label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={form.state.isSubmitting}
                >
                  <option value="Monetaria">Monetaria</option>
                  <option value="En especie">En especie</option>
                </select>
              </div>
            )}
          </form.Field>

          {/* Método */}
          <form.Field
            name="metodo"
            validators={{
              onChange: ({ value }) => !value ? "El método es requerido" : undefined
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Método</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${field.state.meta.errors.length ? 'border-red-500' : ''}`}
                  disabled={form.state.isSubmitting}
                />
                {field.state.meta.errors[0] && <span className="text-red-500 text-xs">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {/* Monto o detalle */}
          <form.Field
            name="monto"
            validators={{
              onChange: ({ value }) => !value ? "El monto o detalle es requerido" : undefined
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Monto o detalle</label>
                <input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${field.state.meta.errors.length ? 'border-red-500' : ''}`}
                  disabled={form.state.isSubmitting}
                />
                {field.state.meta.errors[0] && <span className="text-red-500 text-xs">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {/* Aceptar */}
          <form.Field
            name="aceptar"
            validators={{
              onChange: ({ value }) => !value ? "Debes aceptar para continuar" : undefined
            }}
          >
            {(field) => (
              <div className="mb-4 flex items-start">
                <input
                  id="aceptar"
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  onBlur={field.handleBlur}
                  className="mr-2 mt-1"
                  disabled={form.state.isSubmitting}
                />
                <label htmlFor="aceptar" className="text-gray-700 text-sm">
                  Acepto que esta donación es para fortalecer ASONIDEP.
                </label>
                {field.state.meta.errors[0] && <span className="text-red-500 text-xs ml-2">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-60"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? "Enviando..." : "Enviar mi donación"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default FormularioDonacion;