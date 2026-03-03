import { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { Calendar, ArrowLeft, Clock, MapPin } from 'lucide-react';
import type { EventNewsItem } from '../Types/eventsNews';
import { fetchEventsNews } from '../Services/eventsNewsApi';

const EventNewsDetail: React.FC = () => {
  const formatHour12 = (hhmm?: string) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  const { id } = useParams({ strict: false });
  const [item, setItem] = useState<EventNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('No event ID provided');
        setLoading(false);
        return;
      }

      try {
        // Since we don't have a single event endpoint, fetch all and find the one we need
        const data = await fetchEventsNews();
        // Convert string ID from URL to number for comparison with backend data
        const foundItem = data.find((event: EventNewsItem) => event.id === parseInt(id));
        
        if (foundItem) {
          setItem(foundItem);
        } else {
          setError('Event/News not found');
        }
      } catch (error) {
        console.error('Error fetching event/news:', error);
        setError('Error loading event/news details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Contenido no encontrado'}</p>
          <Link
            to="/events-news"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a eventos y noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gray-50">
      {/* Hero Section with Image */}
      <div
        className="relative w-full h-96 flex items-end"
        style={{
          backgroundImage: item.imageUrl 
            ? `url(${item.imageUrl})` 
            : `url('https://asoniped.org/wp-content/uploads/2023/09/voluntariado-asoniped-1.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Navigation */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/events-news"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-900 rounded-lg hover:bg-white transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        {/* Title and Date Overlay */}
        <div className="relative z-10 text-white max-w-4xl mx-auto px-6 pb-12">
          {item.type && (
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.type === 'evento'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {item.type === 'evento' ? 'Evento' : 'Noticia'}
              </span>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {item.title}
          </h1>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={item.date}>
                {new Date(item.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </time>
            </div>
            {item.hour && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 text-sm">
                <Clock className="w-4 h-4 mr-1" /> {formatHour12(item.hour)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
              {item.description}
            </div>
          </div>

          {/* Event Details Card (for events) */}
          {item.type === 'evento' && (
            <div className="mt-12 bg-orange-50 rounded-lg p-6 border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detalles del Evento
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Fecha</p>
                    <p>{new Date(item.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}</p>
                  </div>
                </div>
                {item.hour && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Hora</p>
                      <p>{formatHour12(item.hour)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Organiza</p>
                    <p>ASONIPED</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action 
          <div className="mt-12 text-center">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                ¿Te interesa participar?
              </h3>
              <p className="text-gray-600 mb-6">
                Contactanos para más información sobre nuestros eventos y actividades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/soporte"
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Contactar
                </Link>
                <Link
                  to="/events-news"
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Ver más eventos
                </Link>
              </div>
            </div>
          </div>
          */}
        </div>
      </div>
    </article>
  );
};

export default EventNewsDetail;