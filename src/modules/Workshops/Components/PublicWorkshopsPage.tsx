import { useState, useEffect } from "react";
import { WorkshopDetailsModal } from "../../Workshops/Pages/WorkshopDetailsModal";
import { getAllWorkshops } from "../Services/workshopService";
import type { Workshop } from "../Services/workshop";


export default function PublicWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Detectar si es móvil
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        setLoading(true);
        const data = await getAllWorkshops();
        setWorkshops(data);
      } catch (error) {
        console.error("Error loading workshops:", error);
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    };

    loadWorkshops();
  }, []);

  // ✅ Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEnroll = (workshop: Workshop) => {
    alert(`Inscrito en: ${workshop.titulo}`);
  };

  const itemsPerView = isMobile ? 1 : 3;

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, workshops.length - itemsPerView) : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= workshops.length - itemsPerView ? 0 : prev + 1
    );
  };

  const visibleWorkshops = workshops.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide mb-5">
          Nuestros talleres
        </h2>
        <p className="text-neutral-700 text-center mb-10">
          Descubre nuestros espacios de aprendizaje y creatividad.
        </p>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Cargando talleres...</div>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              No hay talleres disponibles en este momento.
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            
            {!isMobile && workshops.length > itemsPerView && (
              <button
                onClick={prevSlide}
                className="absolute left-0 bg-white rounded-full shadow p-2 hover:bg-gray-100 z-20"
              >
                ◀
              </button>
            )}

            <div
              className={`w-full gap-8 ${
                isMobile
                  ? "flex overflow-x-auto space-x-4 px-4 scroll-smooth snap-x snap-mandatory"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center"
              }`}
            >
              {(isMobile ? workshops : visibleWorkshops).map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden w-[320px] sm:w-[360px] flex-shrink-0 snap-center flex flex-col border border-gray-200"
                >
                  <div className="relative h-[220px]">
                    {workshop.imagen && !workshop.imagen.startsWith("blob:") ? (
                      <>
                        <img
                          src={
                            workshop.imagen.startsWith("http")
                              ? workshop.imagen
                              : `http://localhost:3000${workshop.imagen}`
                          }
                          alt={workshop.titulo}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const placeholder =
                              target.parentElement?.querySelector(
                                ".image-placeholder"
                              ) as HTMLElement;
                            if (placeholder) placeholder.classList.remove("hidden");
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            const placeholder =
                              target.parentElement?.querySelector(
                                ".image-placeholder"
                              ) as HTMLElement;
                            if (placeholder) placeholder.classList.add("hidden");
                          }}
                        />
                        <div className="image-placeholder absolute inset-0 hidden bg-gray-200">
                          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                            <span>Imagen no disponible</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
                        <span>Imagen no disponible</span>
                      </div>
                    )}
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

            {!isMobile && workshops.length > itemsPerView && (
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

      <WorkshopDetailsModal
        isOpen={selectedWorkshop !== null}
        workshop={selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        onEnroll={handleEnroll}
      />
    </div>
  );
}