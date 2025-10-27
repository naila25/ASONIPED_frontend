import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'workshop' | 'volunteer' | 'attendance';
  time: string;
  location?: string;
  status: 'registered' | 'completed' | 'cancelled';
}

interface CalendarProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      try {
        // Check if event.id contains the date string or if it's a valid date
        if (event.id.includes(dateString)) return true;
        
        // Try to parse the event.id as a date
        const eventDate = new Date(event.id);
        if (!isNaN(eventDate.getTime())) {
          return eventDate.toISOString().split('T')[0] === dateString;
        }
        
        return false;
      } catch (error) {
        console.warn('Error parsing event date:', error);
        return false;
      }
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CalendarIcon className="w-4 h-4" />
          Hoy
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div key={`header-${day}`} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }

          const dayEvents = getEventsForDate(day);
          const isTodayDate = isToday(day);
          const isSelectedDate = isSelected(day);

          return (
            <div
              key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`}
              className={`
                p-2 min-h-[80px] border border-gray-200 rounded-lg cursor-pointer transition-colors
                ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}
                ${isSelectedDate ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}
              `}
              onClick={() => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                onDateSelect(date);
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isTodayDate ? 'text-blue-600' : 
                  isSelectedDate ? 'text-blue-700' : 
                  'text-gray-900'
                }`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              
              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded truncate cursor-pointer
                      ${event.type === 'workshop' ? 'bg-green-100 text-green-800' :
                        event.type === 'volunteer' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
