import { useState, useEffect } from 'react';
import { Clock, MapPin, GraduationCap, Heart, Calendar as CalendarIcon } from "lucide-react";
import { getUserCalendarEvents } from '../Services/userDashboard.service';
import { fetchMyVolunteerProposals } from '../../Volunteers/Services/fetchVolunteers';
import type { UserCalendarEvent } from '../Services/userDashboard.service';
import Calendar from '../../../shared/Components/Calendar';
import { formatTime12Hour } from '../../../shared/Utils/timeUtils';

type VolunteerProposalBrief = {
  id: number;
  title?: string;
  status?: string;
  date?: string;
  created_at?: string;
  hour?: string;
  location?: string;
};

export default function CalendarioPage() {
  const [events, setEvents] = useState<UserCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const [eventsData, proposalsRes] = await Promise.all([
          getUserCalendarEvents(),
          fetchMyVolunteerProposals()
        ]);

        const approvedProposalEvents = (proposalsRes?.proposals as VolunteerProposalBrief[] || [])
          .filter((p) => p.status === 'approved')
          .map((p) => {
            const rawDate = (p.date || p.created_at || new Date().toISOString()).toString();
            // Normalize DD/MM/YYYY -> YYYY-MM-DD for date equality checks
            const isoDate = rawDate.includes('/')
              ? (() => { const [d,m,y] = rawDate.split('/'); return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`; })()
              : rawDate.slice(0,10);
            return {
              id: `proposal-${p.id}`,
              title: p.title || 'Propuesta de voluntariado',
              type: 'volunteer' as const,
              date: isoDate as string,
              time: (typeof p.hour === 'string' && p.hour) ? p.hour : '00:00',
              location: p.location as string | undefined,
              status: 'registered' as const,
            };
          });

        setEvents([...(eventsData || []), ...approvedProposalEvents]);
      } catch (error) {
        console.error('Error loading calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Convert UserCalendarEvent to CalendarEvent format
  const calendarEvents = events.map(event => ({
    id: `${event.date}-${event.id}`,
    title: event.title,
    type: event.type,
    time: event.time,
    location: event.location,
    status: (event.status === 'enrolled' ? 'registered' : event.status) as 'registered' | 'completed' | 'cancelled'
  }));

  // Get events for selected date
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const selectedDateEvents = events.filter(event => event.date === selectedDateString);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario de Actividades</h1>
            <p className="text-gray-600">Visualiza todas tus actividades y eventos programados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Calendar
              events={calendarEvents}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          )}
        </div>

        {/* Events List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </h2>
              <div className="text-sm text-gray-500">
                {selectedDateEvents.length} actividad{selectedDateEvents.length !== 1 ? 'es' : ''}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-3 rounded-lg ${
                      event.type === 'workshop' ? 'bg-green-100' :
                      event.type === 'volunteer' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      {event.type === 'workshop' ? (
                        <GraduationCap className="w-6 h-6 text-green-600" />
                      ) : event.type === 'volunteer' ? (
                        <Heart className="w-6 h-6 text-purple-600" />
                      ) : (
                        <CalendarIcon className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime12Hour(event.time)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
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
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
                <p className="text-gray-500">No tienes actividades programadas para esta fecha</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

