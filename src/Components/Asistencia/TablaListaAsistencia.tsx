import React from 'react';

interface Attendance {
  nombre: string;
  cedula: string;
  tipo: string;
}

interface Props {
  registros: Attendance[];
}

const AttendanceTable: React.FC<Props> = ({ registros }) => {
  if (registros.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-3 text-center">Tabla de Asistencias Registradas</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-center">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border">Nombre completo</th>
              <th className="py-2 px-4 border">Cédula</th>
              <th className="py-2 px-4 border">Tipo de asistencia</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="py-2 px-4 border">{r.nombre}</td>
                <td className="py-2 px-4 border">{r.cedula}</td>
                <td className="py-2 px-4 border">{r.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;