
import { Link } from "@tanstack/react-router";
import { FaUsers, FaUserFriends, FaArrowRight, FaQrcode, FaCalendarAlt, FaChartLine, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dashboardApi } from "../Services/attendanceNewApi";
import type { DashboardStats } from "../Types/attendanceNew";

export default function AttendancePanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await dashboardApi.getStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
                  console.log('Nueva Actividad button clicked');
                  console.log('Current URL before navigation:', window.location.href);
                  console.log('Attempting to navigate to:', '/admin/attendance/activities');
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
          {/* Asistencia de Beneficiarios - QR Scanning */}
          <Link
            to="/admin/attendance/beneficiaries"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              console.log('BENEFICIARIES Link clicked - navigating to beneficiaries');
              console.log('Current URL before:', window.location.href);
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

          {/* Asistencia de Invitados - Manual Entry */}
          <Link
            to="/admin/attendance/guests"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              console.log('GUESTS Link clicked - navigating to guests');
              console.log('Current URL before:', window.location.href);
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

          {/* Lista de Asistencia - Analytics */}
          <Link
            to="/admin/attendance/list"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              console.log('LIST Link clicked - navigating to list');
              console.log('Current URL before:', window.location.href);
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

        {/* Recent Activities */}
        {!loading && stats && stats.recentActivities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h2>
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <FaCalendarAlt className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.event_date).toLocaleDateString('es-ES')} 
                        {activity.event_time && ` • ${activity.event_time.slice(0, 5)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{activity.total_attendance || 0} asistentes</p>
                    <p className="text-xs text-gray-500">
                      {activity.beneficiarios_count || 0} beneficiarios, {activity.guests_count || 0} invitados
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}