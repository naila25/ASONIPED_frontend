import { useEffect, useState } from 'react';
import type { EventNewsItem } from '../Types/eventsNews';
import { fetchEventsNews } from '../Services/eventsNewsApi';
import { Link } from '@tanstack/react-router';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const EventsNews: React.FC = () => {
  const [items, setItems] = useState<EventNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEventsNews();
        setItems(data);
      } catch (error) {
        console.error('Error fetching events/news:', error);
        setError('Error fetching events/news.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestItems = [...items]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? latestItems.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === latestItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative w-full py-10">
      <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide py-6">
        Eventos y Noticias
      </h2>

      {loading ? (
        <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No hay eventos o noticias disponibles.
        </div>
      ) : (
        <div className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-lg">
          <div
            className="w-full h-full bg-cover bg-center flex items-center"
            style={{
              backgroundImage: `url(${latestItems[currentIndex].imageUrl})`,
            }}
          >
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Contenido de la noticia */}
            <div className="relative z-10 text-white max-w-lg px-8 ml-16 space-y-4">
              <h3 className="text-4xl font-bold">{latestItems[currentIndex].title}</h3>
              <p className="text-lg opacity-90"> {latestItems[currentIndex].description
                 .split(' ')
                 .slice(0, 30)
                 .join(' ') + (latestItems[currentIndex].description.split(' ').length > 30 ? '...' : '')}
              </p>
              <Link
                to={`/events-news/${latestItems[currentIndex].id}`}
                className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-orange-600"
              >
                Leer más
              </Link>
            </div>
          </div>

          {/* Flecha izquierda */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 -translate-y-1/2 left-6 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white"
          >
            <FaChevronLeft size={20} />
          </button>

          {/* Flecha derecha */}
          <button
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 right-6 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <Link
          to="/events-news"
          className="mt-auto bg-orange-500 text-white py-2 px-4 rounded-full border hover:bg-orange-600 transition"
        >
          Ver todos los eventos y noticias
        </Link>
      </div>
    </section>
  );
};

export default EventsNews;
