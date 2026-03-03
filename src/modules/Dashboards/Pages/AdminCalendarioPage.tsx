import { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, GraduationCap, Heart, Calendar as CalendarIcon } from "lucide-react";
import { getCalendarActivitiesByMonth } from '../../../shared/Services/statistics.service';
import Calendar from '../../../shared/Components/Calendar';
import { formatTime12Hour } from '../../../shared/Utils/timeUtils';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'workshop' | 'volunteer' | 'attendance';
  date: string;
  time: string;
  location?: string;
  status: 'registered';
}

export default function AdminCalendarioPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Format date string to YYYY-MM-DD format
  const normalizeDate = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    
    try {
      // Handle DD/MM/YYYY format
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Handle YYYY-MM-DD format (already correct)
      if (dateStr.includes('-')) {
        return dateStr.slice(0, 10);
      }
      
      // Fallback: try to parse as Date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return dateStr;
    } catch {
      return dateStr;
    }
  }, []);

  // Fetch activities for the current month
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsTransitioning(true);
        // Small delay to allow smooth transition animation
        await new Promise(resolve => setTimeout(resolve, 150));
        
        setLoading(true);
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // getMonth() returns 0-11
        
        const activities = await getCalendarActivitiesByMonth(year, month);

        // Transform activities to match Calendar component format
        const transformedEvents: CalendarEvent[] = activities.map((activity) => {
          const normalizedDate = normalizeDate(activity.date);
          
          return {
            id: `${normalizedDate}-${activity.id}`,
            title: activity.title,
            type: (activity.type === 'event' ? 'attendance' : activity.type) as CalendarEvent['type'],
            date: normalizedDate,
            time: activity.time || '10:00',
            location: activity.location || undefined,
            status: 'registered' as const
          };
        });

        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error loading calendar activities:', error);
      } finally {
        setLoading(false);
        setIsTransitioning(false);
      }
    };

    loadEvents();
  }, [currentMonth, normalizeDate]);

  // Convert to CalendarEvent format
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    type: event.type,
    time: event.time,
    location: event.location,
    status: event.status
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
            <p className="text-gray-600">Visualiza todas las actividades del sistema</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}>
            <Calendar
              events={calendarEvents}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onMonthChange={setCurrentMonth}
              currentMonth={currentMonth}
            />
          </div>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
                <p className="text-gray-500">No hay actividades programadas para esta fecha</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

