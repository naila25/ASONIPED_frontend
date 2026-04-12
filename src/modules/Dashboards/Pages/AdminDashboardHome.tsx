import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Calendar,
  FileText,
  GraduationCap,
  TrendingUp,
  Heart,
  Clock,
  MapPin,
  Inbox,
} from "lucide-react";
import {
  getStatistics,
  getUpcomingCalendarActivities,
  getRecentActivities,
  type RecentActivity,
  type CalendarActivity,
} from "../../../shared/Services/statistics.service";
import { adminFetchAllProposals } from "../../Volunteers/Services/fetchVolunteers";
import type { VolunteerProposal } from "../../Volunteers/Types/volunteer";
import { FaTicketAlt } from "react-icons/fa";
import type { UserCalendarEvent } from "../Services/userDashboard.service";

function startOfLocalToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/** Parse activity/proposal date string to a local calendar day (DD/MM/YYYY or YYYY-MM-DD). */
function parseLocalCalendarDay(dateString: string): Date | null {
  if (!dateString?.trim()) return null;
  try {
    if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length !== 3) return null;
      const [d, m, y] = parts;
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);
      if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
      return new Date(year, month - 1, day);
    }
    const datePart = dateString.includes("T") ? dateString.split("T")[0] : dateString.split(" ")[0];
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    const dt = new Date(dateString);
    if (Number.isNaN(dt.getTime())) return null;
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  } catch {
    return null;
  }
}

function isArchivedVolunteerProposal(p: VolunteerProposal): boolean {
  return p.status === "filed" || (p.admin_note?.includes("[ARCHIVED]") ?? false);
}

function proposalRawDateToIso(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length !== 3) return "";
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const datePart = s.includes("T") ? s.split("T")[0] : s.split(" ")[0];
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    usuarios: { total: 0, activos: 0, nuevos: 0 },
    eventos: { total: 0, proximos: 0, activos: 0 },
    expedientes: { total: 0, pendientes: 0, aprobados: 0 },
    talleres: { total: 0, activos: 0, inscritos: 0 },
    voluntariado: { programas: 0, voluntarios: 0, horas: 0 },
    tickets: { total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<UserCalendarEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Format a date string safely (handles DD/MM/YYYY and ISO/UTC without TZ shift)
  const formatDisplayDate = (input: string): string => {
    try {
      if (!input) return '';
      // Normalize any slash-based date as DD/MM/YYYY (project convention)
      if (input.includes('/')) {
        const parts = input.split('/');
        if (parts.length === 3) {
          const [dayStr, monthStr, y] = parts;
          const day = parseInt(dayStr, 10);
          const month = parseInt(monthStr, 10);
          const dateObj = new Date(Number(y), month - 1, day);
          return dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
        return input;
      }
      // Extract YYYY-MM-DD part if ISO with time or with space 'YYYY-MM-DD HH:MM:SS'
      const datePart = (input.includes('T') ? input.split('T')[0] : input.split(' ')[0]);
      const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const [, y, m, d] = match;
        const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
        return dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
      // Fallback: try native Date
      const fallback = new Date(input);
      if (!isNaN(fallback.getTime())) return fallback.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      return input;
    } catch {
      return input;
    }
  };

  // Format HH:MM (24h) to 12-hour AM/PM
  const formatHour12 = (hhmm?: string): string => {
    if (!hhmm) return '';
    try {
      const [h, m] = hhmm.split(':');
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return hhmm;
    }
  };

  // Upcoming system activities + approved volunteer proposals (same idea as admin calendar).
  const fetchUpcomingActivities = useCallback(async (): Promise<UserCalendarEvent[]> => {
    const mapActivity = (activity: CalendarActivity): UserCalendarEvent => ({
      id: activity.id,
      title: activity.title,
      type: activity.type === "event" ? "attendance" : activity.type,
      date: activity.date,
      time: activity.time || "10:00",
      location: activity.location || undefined,
      status: "registered" as const,
    });

    try {
      const [activities, proposalsRes] = await Promise.all([
        getUpcomingCalendarActivities(20),
        adminFetchAllProposals().catch(() => ({ proposals: [] as VolunteerProposal[] })),
      ]);

      const fromApi = activities.map(mapActivity);
      const todayStart = startOfLocalToday();

      const fromProposals: UserCalendarEvent[] = (proposalsRes.proposals || [])
        .filter((p) => p.status === "approved" && !isArchivedVolunteerProposal(p))
        .flatMap((p): UserCalendarEvent[] => {
          const raw = (p.date || "").toString();
          if (!raw) return [];
          const iso = proposalRawDateToIso(raw).slice(0, 10);
          if (iso.length !== 10) return [];
          const day = parseLocalCalendarDay(iso);
          if (!day) return [];
          const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          if (dayStart < todayStart) return [];
          const time =
            typeof p.hour === "string" && p.hour.trim() ? p.hour : "00:00";
          return [
            {
              id: `proposal-${p.id}`,
              title: p.title || "Propuesta de voluntariado",
              type: "volunteer" as const,
              date: iso,
              time,
              location: p.location || undefined,
              status: "registered" as const,
            },
          ];
        });

      const merged = [...fromApi, ...fromProposals];
      merged.sort((a, b) => {
        const da = parseLocalCalendarDay(a.date);
        const db = parseLocalCalendarDay(b.date);
        const ta = da ? new Date(da.getFullYear(), da.getMonth(), da.getDate()).getTime() : 0;
        const tb = db ? new Date(db.getFullYear(), db.getMonth(), db.getDate()).getTime() : 0;
        if (ta !== tb) return ta - tb;
        return (a.time || "").localeCompare(b.time || "");
      });

      return merged.slice(0, 10);
    } catch (error) {
      console.error("Error fetching upcoming activities:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statistics, activities, recent] = await Promise.all([
          getStatistics(),
          fetchUpcomingActivities(),
          getRecentActivities(5)
        ]);
        
        setStats({
          usuarios: { total: statistics.users, activos: 0, nuevos: 0 },
          eventos: { total: statistics.events, proximos: 0, activos: 0 },
          expedientes: { total: statistics.beneficiaries, pendientes: 0, aprobados: 0 },
          talleres: { total: statistics.workshops, activos: 0, inscritos: 0 },
          voluntariado: { programas: 0, voluntarios: statistics.volunteers, horas: 0 },
          tickets: { total: statistics.tickets || 0 }
        });
        
        setCalendarEvents(activities);
        setRecentActivities(recent);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUpcomingActivities]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600">Bienvenido al centro de control de ASONIPED</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Usuarios Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "0" : stats.usuarios.total}
              </p>
              <p className="text-xs text-gray-500">Total en el sistema</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Eventos Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventos</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "0" : stats.eventos.total}
              </p>
              <p className="text-xs text-gray-500">Total eventos/noticias</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Expedientes Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expedientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "0" : stats.expedientes.total}
              </p>
              <p className="text-xs text-gray-500">Total expedientes</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Talleres Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Talleres</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "0" : stats.talleres.total}
              </p>
              <p className="text-xs text-gray-500">Total talleres</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Voluntariado Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voluntariado</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "0" : stats.voluntariado.voluntarios}
              </p>
              <p className="text-xs text-gray-500">Total voluntariado</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

            {/* Tickets */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "0" : stats.tickets.total}
              </p>
              <p className="text-xs text-gray-500">Tickets abiertos</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <FaTicketAlt className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
      
  

      {/* Recent Activities and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'expediente' ? 'bg-blue-100' :
                    activity.type === 'ticket' ? 'bg-green-100' :
                    activity.type === 'taller' ? 'bg-orange-100' :
                    activity.type === 'voluntario' ? 'bg-purple-100' :
                    activity.type === 'propuesta_voluntariado' ? 'bg-rose-100' :
                    'bg-indigo-100'
                  }`}>
                    {activity.type === 'expediente' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : activity.type === 'ticket' ? (
                      <FaTicketAlt className="w-4 h-4 text-green-600" />
                    ) : activity.type === 'taller' ? (
                      <GraduationCap className="w-4 h-4 text-orange-600" />
                    ) : activity.type === 'voluntario' ? (
                      <Heart className="w-4 h-4 text-purple-600" />
                    ) : activity.type === 'propuesta_voluntariado' ? (
                      <Inbox className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Calendar className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.user && `${activity.user} • `}
                      {activity.workshop && `${activity.workshop} • `}
                      {activity.event && `${activity.event} • `}
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay actividades recientes</p>
            </div>
          )}
        </div>

         {/* Calendar Widget */}
         <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Actividades</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : calendarEvents.length > 0 ? (
            <div className="space-y-3">
              {calendarEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    event.type === 'workshop' ? 'bg-green-100' :
                    event.type === 'volunteer' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    {event.type === 'workshop' ? (
                      <GraduationCap className="w-4 h-4 text-green-600" />
                    ) : event.type === 'volunteer' ? (
                      <Heart className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Calendar className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDisplayDate(event.date)}</span>
                      <span>• {formatHour12(event.time)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {calendarEvents.length > 4 && (
                <div className="text-center pt-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Ver todas las actividades ({calendarEvents.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay actividades próximas</p>
              <p className="text-sm text-gray-400 mt-2">Crea talleres, voluntariado o eventos</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

