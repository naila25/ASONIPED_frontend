import { FaUsers, FaCalendarAlt, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dashboardApi } from "../Services/attendanceNewApi";
import type { DashboardStats } from "../Types/attendanceNew";

export default function AttendancePanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard stats...');
        const dashboardStats = await dashboardApi.getStats();
        console.log('Dashboard stats received:', dashboardStats);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // Set default stats to prevent UI issues
        setStats({
          totalActivities: 0,
          activeActivities: 0,
          totalAttendance: 0,
          todayAttendance: 0,
          recentActivities: []
        });
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
                Actividades
              </button>
            </div>
          </div>
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