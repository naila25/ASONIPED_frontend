import { Link } from "@tanstack/react-router";
import { FaUsers, FaUserFriends, FaArrowRight, FaQrcode, FaChartLine, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dashboardApi } from "../Services/attendanceNewApi";
import type { DashboardStats } from "../Types/attendanceNew";

// Define los tipos para TypeScript
type Workshop = {
  id: string;
  title: string;
};

type Attendance = {
  id: string;
  name: string;
  workshopId: string;
  status: string; // "present" | "absent"
};

export default function AttendancePanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtro de asistentes
  const [searchTerm, setSearchTerm] = useState('');
  const [workshopFilter, setWorkshopFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Arrays de datos, aquí debes traer los datos reales del backend
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  // Ejemplo de cómo traer datos del backend (AJUSTA los endpoints y el formato según tu API)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const dashboardStats = await dashboardApi.getStats();
        setStats(dashboardStats);

        // TODO: Cambia las URLs y el formato según tu backend
        const ws = await fetch('/api/workshops').then(res => res.json());
        setWorkshops(ws);

        const at = await fetch('/api/attendances').then(res => res.json());
        setAttendances(at);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Filtro de asistentes
  const filteredAttendances = attendances.filter(attendance => {
    const matchesSearch = attendance.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkshop = workshopFilter === 'all' || attendance.workshopId === workshopFilter;
    const matchesStatus = statusFilter === 'all' || attendance.status === statusFilter;
    return matchesSearch && matchesWorkshop && matchesStatus;
  });

  return (
    <main>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <FaUsers className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Módulo de Asistencia</h1>
                <p className="text-gray-600">
                  Sistema moderno de control de asistencia con escaneo QR y gestión de actividades.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = '/admin/attendance/activities';
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                Nueva Actividad
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/attendance/beneficiaries"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/admin/attendance/beneficiaries';
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FaQrcode className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Escaneo QR - Beneficiarios
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Escanea códigos QR para registrar asistencia de beneficiarios.
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            to="/admin/attendance/guests"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/admin/attendance/guests';
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FaUserFriends className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Registro Manual
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Registra manualmente la asistencia con formularios.
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
          <Link
            to="/admin/attendance/list"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/admin/attendance/list';
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FaChartLine className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Analytics & Reportes
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Visualiza estadísticas, reportes y exporta datos de asistencia.
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <h2 className="text-lg font-medium text-gray-900">Filtros y Búsqueda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Buscador por nombre de asistente */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar asistente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            {/* Filtro por taller */}
            <select
              value={workshopFilter}
              onChange={e => setWorkshopFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">Todos los talleres</option>
              {workshops.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
            {/* Filtro por estado de asistencia */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="present">Presente</option>
              <option value="absent">Ausente</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <span className="font-medium text-gray-700">{filteredAttendances.length}</span>
            <span className="ml-1">asistentes encontrados</span>
          </div>
        </div>

        {/* Puedes mostrar la lista filtrada debajo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Asistentes Filtrados</h2>
          <ul>
            {filteredAttendances.map(att => (
              <li key={att.id} className="py-2 border-b flex justify-between items-center">
                <span>{att.name}</span>
                <span className="text-xs text-gray-500">{workshops.find(w => w.id === att.workshopId)?.title || 'Taller desconocido'}</span>
                <span className={`px-2 py-1 rounded ${att.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {att.status === 'present' ? 'Presente' : 'Ausente'}
                </span>
              </li>
            ))}
            {filteredAttendances.length === 0 && (
              <li className="py-2 text-gray-500">No hay asistentes que coincidan con los filtros.</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}