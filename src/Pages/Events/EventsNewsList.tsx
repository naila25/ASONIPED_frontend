import { useEffect, useState } from 'react';
import type { EventNewsItem } from '../../types/eventsNews';
import { getEventsNews } from '../../Utils/eventsNewsApi';
import { Link } from '@tanstack/react-router';

const ITEMS_PER_PAGE = 9;

const EventsNewsList: React.FC = () => {
  const [items, setItems] = useState<EventNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalItem, setModalItem] = useState<EventNewsItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEventsNews();
        setItems(
          data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      } catch (err) {
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
    <section className=" max-w-7xl mx-auto py-20 px-4 flex flex-col">
      <div className="flex justify-start mb-6">
        <Link
          to="/"
          className="bg-gradient-to-r text-white from-orange-400 to-orange-700 py-3 px-6 rounded-md text-sm hover:opacity-90 transition"
        >
          Volver al inicio
        </Link>
      </div>
      <h1 className="text-3xl  mb-8 text-center text-gray-800">
        Eventos y Noticias
      </h1>
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                    {item.description}
                  </p>
                  {item.description.length > 100 && (
                    <button
                      onClick={() => setModalItem(item)}
                      className="text-blue-600 hover:underline font-medium self-start"
                    >
                      Leer más
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {/* Modal for full description */}
          {modalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
                <button
                  onClick={() => setModalItem(null)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-600 text-2xl font-bold"
                  aria-label="Cerrar"
                >
                  ×
                </button>
                {modalItem.imageUrl && (
                  <img
                    src={modalItem.imageUrl}
                    alt={modalItem.title}
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{modalItem.title}</h3>
                <time
                  className="text-sm text-gray-500 mb-4 block"
                  dateTime={modalItem.date}
                >
                  {new Date(modalItem.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <p className="text-gray-700 text-base mb-2 whitespace-pre-line">
                  {modalItem.description}
                </p>
              </div>
            </div>
          )}
          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded bg-blue-600 text-white font-medium transition-colors hover:bg-blue-700 disabled:opacity-50`}
            >
              Previous
            </button>
            <span className="self-center text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded bg-blue-600 text-white font-medium transition-colors hover:bg-blue-700 disabled:opacity-50`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default EventsNewsList;
