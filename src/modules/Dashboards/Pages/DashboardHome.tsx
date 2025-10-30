import { useState, useEffect } from 'react';
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
            date: p.created_at || p.date || new Date().toISOString(),
            time: undefined,
            status: normalizedStatus,
            description: 'Propuesta de voluntariado enviada'
          };
        });

        // Merge and keep latest 5 by date desc
        const merged = [...activitiesData, ...proposals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        setActivities(merged);
        // Add approved proposals into the calendar
        const approvedProposalEvents = (proposalsRes?.proposals as VolunteerProposalBrief[] || [])
          .filter((p) => p.status === 'approved')
          .map((p) => ({
            id: `proposal-${p.id}`,
            title: p.title || 'Propuesta de voluntariado',
            type: 'volunteer' as const,
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
  }, []);

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
                      <span>{(() => {
                        try {
                          // Handle DD/MM/YYYY format (already correct)
                          if (activity.date.includes('/')) {
                            return activity.date;
                          }
                          // Handle ISO format and convert to DD/MM/YYYY
                          const date = new Date(activity.date);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('es-ES');
                          }
                          return activity.date;
                        } catch {
                          return activity.date;
                        }
                      })()}</span>
                      {activity.time && <span>• {activity.time}</span>}
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
                      <span>{(() => {
                        try {
                          // Handle DD/MM/YYYY format (already correct)
                          if (event.date.includes('/')) {
                            return event.date;
                          }
                          // Handle ISO format and convert to DD/MM/YYYY
                          const date = new Date(event.date);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('es-ES');
                          }
                          return event.date;
                        } catch {
                          return event.date;
                        }
                      })()}</span>
                      <span>• {event.time}</span>
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

