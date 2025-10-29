import { useEffect, useState } from 'react';
import type { EventNewsItem } from '../Types/eventsNews';
import { fetchEventsNews } from '../Services/eventsNewsApi';

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
        const data = await fetchEventsNews();
        setItems(
          data.sort((a: EventNewsItem, b: EventNewsItem) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
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
          backgroundImage: `url('https://asoniped.org/wp-content/uploads/2023/09/voluntariado-asoniped-1.jpg')`,
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

            {/* Modal para leer más */}
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

            {/* Controles de paginación */}
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
      </div>
    </section>
  );
};

export default EventsNewsList;
