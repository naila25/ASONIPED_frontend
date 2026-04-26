import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { EventNewsItem } from '../Types/eventsNews';
import { fetchEventsNews } from '../Services/eventsNewsApi';
import eventos from '../../../assets/eventos.jpeg';

const ITEMS_PER_PAGE = 9;

const EventsNewsList: React.FC = () => {
  const formatHour12 = (hhmm?: string) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  // Format date string safely (handles M/D/YYYY format and ISO/UTC without TZ shift)
  const formatDisplayDate = (input: string): string => {
    try {
      if (!input) return '';
      // Slash-based input: assume M/D/YYYY and normalize to DD/MM/YYYY
      if (input.includes('/')) {
        const parts = input.split('/');
        if (parts.length === 3) {
          const [monthStr, dayStr, y] = parts;
          const month = parseInt(monthStr, 10);
          const day = parseInt(dayStr, 10);
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
        // Build date using local timezone components to avoid UTC shift
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
  const [items, setItems] = useState<EventNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEventsNews();
        const getTime = (d: string) => {
          try {
            if (!d) return -Infinity;
            if (d.includes('/')) {
              const [m, day, y] = d.split('/');
              return new Date(parseInt(y), parseInt(m) - 1, parseInt(day)).getTime();
            }
            const datePart = (d.includes('T') ? d.split('T')[0] : d.split(' ')[0]);
            const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])).getTime();
            const f = new Date(d);
            return isNaN(f.getTime()) ? -Infinity : f.getTime();
          } catch { return -Infinity; }
        };
        setItems(
          data.sort((a: EventNewsItem, b: EventNewsItem) => getTime(b.date) - getTime(a.date))
        );
      } catch (error) {
        console.error('Error fetching events/news:', error);
        setError('Error fetching events/news.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <section className="flex flex-col">
      {/* 🟦 HERO fuera del contenedor limitado */}
      <div
        className="relative w-full h-72 flex items-center justify-center"
        style={{
          backgroundImage: `url(${eventos})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-semibold text-white z-10 tracking-wide text-center px-4">
          Todos los eventos y noticias
        </h1>
      </div>

      {/* 🟩 Descripción debajo del hero */}
      <div className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Explorá todas las actividades, noticias y eventos organizados por ASONIPED.
Mantenete al día con nuestros proyectos, logros y oportunidades para participar en comunidad.
          </p>
        </div>
      </div>

      {/* 🟩 Contenido principal centrado */}
      <div className="max-w-7xl mx-auto py-20 px-4 flex flex-col">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-lg shadow-md h-64"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No events or news available.
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {paginatedItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <time dateTime={item.date}>
                        {formatDisplayDate(item.date)}
                      </time>
                      {item.hour && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 text-xs font-medium">
                          {formatHour12(item.hour)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {item.description}
                    </p>
                    {item.description.length > 100 && (
                      <Link
                        to="/events-news/$id"
                        params={{ id: String(item.id) }}
                        className="text-orange-600 hover:underline font-medium self-start"
                      >
                        Leer más
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>


            {/* Controles de paginación */}
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600`}
              >
                Anterior
              </button>
              <span className="self-center text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600`}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EventsNewsList;
