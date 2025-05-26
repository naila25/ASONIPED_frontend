import React, { useState } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    } else {
      alert('Por favor, complete todos los campos.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Lista de Asistencia</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="cedula"
          placeholder="Cédula"
          value={formData.cedula}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <div>
          <label className="block mb-1 font-medium">Tipo de asistencia</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
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
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Registrar asistencia
        </button>
      </form>
    </div>
  );
};

export default ListaAsistencia;