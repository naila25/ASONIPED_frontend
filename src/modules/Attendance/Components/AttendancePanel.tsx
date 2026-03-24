import { FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { dashboardApi } from '../Services/attendanceNewApi';
import type { DashboardStats } from '../Types/attendanceNew';
import AttendanceSubNav from './AttendanceSubNav';

export default function AttendancePanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await dashboardApi.getStats();
        setStats(dashboardStats);
      } catch {
        setStats({
          totalActivities: 0,
          activeActivities: 0,
          totalAttendance: 0,
          todayAttendance: 0,
          recentActivities: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-xl bg-teal-100 p-3 text-teal-700">
                <FaUsers className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Módulo de Asistencia</h1>
                <p className="mt-1 max-w-2xl text-gray-600">
                  Control de asistencia con escaneo QR, registro manual y reportes por actividad.
                </p>
              </div>
            </div>
          </div>
          <AttendanceSubNav className="mt-6 border-t border-gray-100 pt-6" />
        </div>

        {loading && (
          <div
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
            aria-busy="true"
            aria-label="Cargando resumen"
          >
            <div className="mb-4 h-6 w-48 animate-pulse rounded-md bg-gray-100" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        {!loading && stats && stats.recentActivities.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Actividades recientes</h2>
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-teal-100 p-2 text-teal-700">
                      <FaCalendarAlt className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.event_date).toLocaleDateString('es-ES')}
                        {activity.event_time && ` • ${activity.event_time.slice(0, 5)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.total_attendance || 0} asistentes
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.beneficiarios_count || 0} beneficiarios, {activity.guests_count || 0}{' '}
                      invitados
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
