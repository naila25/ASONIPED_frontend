import { useEffect, useState } from 'react';
import type { EventNewsItem } from '../Types/eventsNews';
import { fetchEventsNews } from '../Services/eventsNewsApi';
import { Link } from '@tanstack/react-router';

const EventsNews: React.FC = () => {
  const [items, setItems] = useState<EventNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Sort and get the 3 latest
  const latestItems = [...items]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section className='py-10'>
      <h2
        id="events-news-heading"
        className="text-orange-700 text-3xl sm:text-6xl lg:text-5xl text-center tracking-wide py-6"
      >
        Eventos y Noticias
        <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
            {" "}
            De ASONIPED
          </span>
      </h2>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2].map((i) => (
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
          No hay eventos o noticias disponibles.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 py-3">
          {latestItems.map((item) => (
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
                <time
                  className="text-sm text-gray-500 mb-4"
                  dateTime={item.date}
                >
                  {new Date(item.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="flex justify-center mt-6">
        <Link
          to="/events-news"
          className="text-white bg-gradient-to-r from-orange-400 to-orange-700 py-2 px-6 rounded hover:bg-orange-600 transition-colors hover:opacity-90 font-medium"
        >
          Ver todos los eventos y noticias
        </Link>
      </div>
    </section>
  );
};

export default EventsNews;