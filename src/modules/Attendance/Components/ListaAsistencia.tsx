import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

type Attendance = {
  nombre: string;
  cedula: string;
  tipo: string;
};

interface Props {
  onNewAttendance: (record: Attendance) => void;
}

const ListaAsistencia: React.FC<Props> = ({ onNewAttendance }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    tipo: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nombre && formData.cedula && formData.tipo) {
      onNewAttendance(formData);
      setFormData({ nombre: '', cedula: '', tipo: '' });
      setFormError(null);
    } else {
      setFormError('Completa nombre, cédula y tipo de asistencia.');
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-center text-xl font-bold text-gray-900">Lista de asistencia</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            <FaExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
            <span>{formError}</span>
          </div>
        )}
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-teal-500"
        />

        <input
          type="text"
          name="cedula"
          placeholder="Cédula"
          value={formData.cedula}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-teal-500"
        />

        <div>
          <label htmlFor="lista-asistencia-tipo" className="mb-1 block font-medium text-gray-700">
            Tipo de asistencia
          </label>
          <select
            id="lista-asistencia-tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Seleccione tipo de asistencia</option>
            <option value="Cursos">Cursos</option>
            <option value="Talleres">Talleres</option>
            <option value="Actividades">Actividades</option>
            <option value="Comedor">Comedor</option>
          </select>
        </div>

        <button
          type="submit"
          className="min-h-[44px] w-full rounded-lg bg-teal-600 py-3 text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          Registrar asistencia
        </button>
      </form>
    </div>
  );
};

export default ListaAsistencia;
