import { useState, useEffect } from "react";
import { WorkshopDetailsModal } from "../../Workshops/Pages/WorkshopDetailsModal";
import { getAllWorkshops } from "../Services/workshopService";
import type { Workshop } from "../Services/workshop";

export default function PublicWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
  const loadWorkshops = async () => {
    try {
      setLoading(true);
      const data = await getAllWorkshops();
      setWorkshops(data);
    } catch (error) {
      console.error('Error loading workshops:', error);
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

    loadWorkshops();
  }, []);

  const handleEnroll = (workshop: Workshop) => {
    alert(`Inscrito en: ${workshop.titulo}`);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, workshops.length - 3) : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= Math.max(0, workshops.length - 3) ? 0 : prev + 1
    );
  };

  const visibleWorkshops = workshops.slice(currentIndex, currentIndex + 3);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Título principal */}
        <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-justify tracking-wide mb-5">
          Nuestros talleres
        </h2>
        <p className="text-neutral-700 text-justify mb-10">
          Descubre nuestros espacios de aprendizaje y creatividad.
        </p>

        {/* Carrusel con 3 cards */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Cargando talleres...</div>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No hay talleres disponibles en este momento.</div>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Botón Anterior */}
            {workshops.length > 3 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 bg-white rounded-full shadow p-2 hover:bg-gray-100 z-20"
              >
                ◀
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center w-full">
              {visibleWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden w-[320px] sm:w-[360px] flex flex-col border border-gray-200"
                >
                  <div className="h-[220px]">
                    {workshop.imagen && !workshop.imagen.startsWith('blob:') ? (
                      <img
                        src={workshop.imagen.startsWith('http') ? workshop.imagen : `http://localhost:3000${workshop.imagen}`}
                        alt={workshop.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                        if (placeholder) placeholder.classList.remove('hidden');
                      }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                          if (placeholder) placeholder.classList.add('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        <span>Imagen no disponible</span>
                      </div>
                    )}
                    {/* Placeholder div - shown when image fails to load */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm image-placeholder hidden">
                      <span>Imagen no disponible</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col items-start">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {workshop.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {workshop.descripcion}
                    </p>
                    <button
                      onClick={() => setSelectedWorkshop(workshop)}
                      className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-orange-600"
                    >
                      Ver más
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón Siguiente */}
            {workshops.length > 3 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 bg-white rounded-full shadow p-2 hover:bg-gray-100 z-20"
              >
                ▶
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <WorkshopDetailsModal
        isOpen={selectedWorkshop !== null}
        workshop={selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        onEnroll={handleEnroll}
      />
    </div>
  );
}