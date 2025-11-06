import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  GraduationCap, 
  Heart, 
  Calendar,
  Clock,
  MapPin,
  Ticket,
} from "lucide-react";
import { FaHandsHelping } from 'react-icons/fa';
import { getUserActivities, getUserCalendarEvents, quickActions } from '../Services/userDashboard.service';
import { fetchMyVolunteerProposals } from '../../Volunteers/Services/fetchVolunteers';
type VolunteerProposalBrief = {
  id: number;
  title?: string;
  status?: string;
  date?: string;
  created_at?: string;
  hour?: string;
  location?: string;
};
import type { UserActivity, UserCalendarEvent } from '../Services/userDashboard.service';

export default function DashboardHome() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<UserCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Comparable timestamp for mixed date formats (DD/MM/YYYY or ISO)
  const getTimeForSort = useCallback((input: string): number => {
    if (!input) return -Infinity;
    try {
      if (input.includes('/')) {
        const [d, m, y] = input.split('/');
        const dt = new Date(Number(y), Number(m) - 1, Number(d));
        return dt.getTime();
      }
      // Support 'YYYY-MM-DD' and 'YYYY-MM-DD HH:MM:SS'
      const datePart = (input.includes('T') ? input.split('T')[0] : input.split(' ')[0]);
      const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const [, y, m, d] = match;
        return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
      }
      const iso = new Date(input);
      return isNaN(iso.getTime()) ? -Infinity : iso.getTime();
    } catch {
      return -Infinity;
    }
  }, []);

  // Determine the most relevant action timestamp for an activity-like item
  type ActivityLike = {
    created_at?: string | Date;
    updated_at?: string | Date;
    registration_date?: string | Date;
    cancellation_date?: string | Date;
    submissionDate?: string | Date;
    submission_date?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    timestamp?: string | Date;
    date?: string | Date;
  };

  const getActionTime = useCallback((item: ActivityLike): number => {
    const candidate =
      item?.created_at ||
      item?.updated_at ||
      item?.registration_date ||
      item?.cancellation_date ||
      item?.submissionDate ||
      item?.submission_date ||
      item?.createdAt ||
      item?.updatedAt ||
      item?.timestamp ||
      item?.date;

    if (!candidate) return -Infinity;
    // Support Date objects or strings
    if (candidate instanceof Date) return candidate.getTime();
    return getTimeForSort(String(candidate));
  }, [getTimeForSort]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [activitiesData, calendarData, proposalsRes] = await Promise.all([
          getUserActivities(5),
          getUserCalendarEvents(),
          fetchMyVolunteerProposals()
        ]);

        const proposals = (proposalsRes?.proposals as VolunteerProposalBrief[] || []).map((p) => {
          const normalizedStatus: 'approved' | 'rejected' | 'pending' =
            p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending';
          return {
            id: `proposal-${p.id}`,
            title: p.title || 'Propuesta de voluntariado',
            type: 'volunteer' as const,
            // Prefer the event date for display/sorting; fall back to creation time
            date: p.date || p.created_at || new Date().toISOString(),
            time: undefined,
            status: normalizedStatus,
            description: 'Propuesta de voluntariado enviada'
          };
        });

        // Merge and keep latest 5 by date desc
        // Align activity dates with calendar where ids match (avoids backend format mismatches)
        const calById = new Map(calendarData.map((e) => [String(e.id), e]));
        const normalizedActivities = (activitiesData || []).map((a) => {
          const match = calById.get(String(a.id));
          if (match && (a.type === 'volunteer' || a.type === 'workshop')) {
            return { ...a, date: match.date, time: a.time || match.time };
          }
          return a;
        });

        const merged = [...normalizedActivities, ...proposals]
          .sort((a, b) => getActionTime(b) - getActionTime(a))
          .slice(0, 5);
        setActivities(merged);
        // Add approved proposals into the calendar
        const approvedProposalEvents = (proposalsRes?.proposals as VolunteerProposalBrief[] || [])
          .filter((p) => p.status === 'approved')
          .map((p) => ({
            id: `proposal-${p.id}`,
            title: p.title || 'Propuesta de voluntariado',
            type: 'volunteer' as const,
            // Keep the same ordering preference here too
            date: p.date || p.created_at || new Date().toISOString().split('T')[0],
            time: (p.hour && typeof p.hour === 'string') ? p.hour : '00:00',
            location: p.location,
            status: 'registered' as const
          }));

        setCalendarEvents([...calendarData, ...approvedProposalEvents]);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [getActionTime]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">¡Hola, Usuario!</h1>
            <p className="text-gray-600">Bienvenido a tu panel personal de ASONIPED</p>
          </div>
        </div>
      </div>



      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={quickActions.createRecord}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Expediente</span>
          </button>
          <button 
            onClick={quickActions.enrollWorkshop}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <GraduationCap className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Inscribirse a Taller</span>
          </button>
          <button 
            onClick={() => window.location.href = '/VolunteerCard'}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <Heart className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Inscribirse a Voluntariado</span>
          </button>
        </div>
      </div>

      {/* Recent Activities and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'workshop' ? 'bg-green-100' :
                    activity.type === 'volunteer' ? 'bg-purple-100' :
                    activity.type === 'attendance' ? 'bg-orange-100' :
                    activity.type === 'ticket' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {activity.type === 'workshop' ? (
                      <GraduationCap className="w-4 h-4 text-green-600" />
                    ) : activity.type === 'volunteer' ? (
                      <FaHandsHelping className="w-4 h-4 text-purple-600" />
                    ) : activity.type === 'attendance' ? (
                      <Calendar className="w-4 h-4 text-orange-600" />
                    ) : activity.type === 'ticket' ? (
                      <Ticket className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDisplayDate(activity.date)}</span>
                      {activity.time && <span>• {formatHour12(activity.time)}</span>}
                    </div>
                    {activity.description && (
                      <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                    activity.status === 'registered' ? 'bg-green-100 text-green-800' :
                    activity.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                    activity.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                    activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status === 'completed' ? 'Completado' :
                     activity.status === 'approved' ? 'Aprobado' :
                     activity.status === 'pending' ? 'Pendiente' :
                     activity.status === 'enrolled' ? 'Inscrito' :
                     activity.status === 'registered' ? 'Registrado' :
                     activity.status === 'open' ? 'Abierto' :
                     activity.status === 'closed' ? 'Cerrado' :
                     activity.status === 'archived' ? 'Archivado' :
                     activity.status === 'cancelled' ? 'Cancelado' :
                     'Rechazado'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay actividades recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendario de Actividades</h2>
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
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                    event.status === 'completed' ? 'bg-green-100 text-green-800' :
                    event.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status === 'registered' ? 'Inscrito' :
                     event.status === 'completed' ? 'Completado' :
                     event.status === 'enrolled' ? 'Inscrito' :
                     'Cancelado'}
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
              <p>No tienes actividades programadas</p>
              <p className="text-sm text-gray-400 mt-2">Inscríbete en talleres o voluntariado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

