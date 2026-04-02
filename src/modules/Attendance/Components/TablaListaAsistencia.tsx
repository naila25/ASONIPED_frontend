import React from 'react';
import { FaTable, FaIdCard } from 'react-icons/fa';
import AttendanceEmptyState from './AttendanceEmptyState';

interface Attendance {
  nombre: string;
  cedula: string;
  tipo: string;
  created_at?: string;
}

interface Props {
  registros: Attendance[];
}

const TablaListaAsistencia: React.FC<Props> = ({ registros }) => {
  if (registros.length === 0) {
    return (
      <AttendanceEmptyState
        className="mt-8"
        icon={<FaTable className="h-7 w-7" />}
        title="Aún no hay registros"
        description="Cuando registres asistencias con el formulario de arriba, aparecerán aquí."
      />
    );
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">Registros</h3>

      <ul className="space-y-3 md:hidden">
        {registros.map((r, index) => (
          <li
            key={`${r.cedula}-${index}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="font-medium text-gray-900">{r.nombre}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <FaIdCard className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                {r.cedula}
              </span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
                {r.tipo}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {r.created_at ? new Date(r.created_at).toLocaleString('es-ES') : '—'}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden max-h-[min(70vh,560px)] overflow-auto rounded-xl border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Nombre</th>
              <th className="px-4 py-3 font-medium text-gray-700">Cédula</th>
              <th className="px-4 py-3 font-medium text-gray-700">Tipo</th>
              <th className="px-4 py-3 font-medium text-gray-700">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {registros.map((r, index) => (
              <tr key={`${r.cedula}-${index}`} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{r.cedula}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{r.tipo}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {r.created_at ? new Date(r.created_at).toLocaleString('es-ES') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaListaAsistencia;
