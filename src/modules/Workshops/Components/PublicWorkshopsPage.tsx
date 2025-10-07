import { useState } from "react";
import { WorkshopDetailsModal } from "../../Workshops/Pages/WorkshopDetailsModal";

type Workshop = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  location?: string;
  date?: string;
  time?: string;
  objectives?: string[];
  materials?: string[];
  learnText?: string;
};

const workshops: Workshop[] = [
  {
    id: 1,
    title: "Artes Prácticas",
    description: "Sumérgete en el mundo de la creatividad con nuestro Taller de Artes Prácticas...",
    imageUrl: "https://analiagattone.com.ar/wp-content/uploads/2021/11/taller-de-arte-adultos05.jpg",
    location: "Aula 101",
    date: "2025-11-10",
    time: "10:00",
    materials: ["Papel", "Pinturas", "Pinceles"],
    learnText: "Aprenderás técnicas básicas de arte práctico.",
  },
  {
    id: 2,
    title: "Sabor y sazón en la cocina",
    description: "¡Despierta tu chef interior y únete a nuestro Taller de Cocina!...",
    imageUrl: "https://i0.wp.com/foodandpleasure.com/wp-content/uploads/2024/05/talleres-de-cocina-en-la-cdmx-taller-gastronomico.jpg?fit=1080%2C1080&ssl=1a",
    location: "Cocina central",
    date: "2025-11-12",
    time: "16:00",
    materials: ["Delantal", "Cuchillo de cocina"],
    learnText: "Aprenderás recetas fáciles y deliciosas.",
  },
  {
    id: 3,
    title: "Deportes",
    description: "¡Activa tu cuerpo y tu mente en nuestro Taller de Deporte!...",
    imageUrl: "https://s3.us-east-2.amazonaws.com/img2.eltipografo.cl/media/2025/01/472530498_18150627061349449_6245436770163400317_n.jpg",
    location: "Gimnasio",
    date: "2025-11-15",
    time: "09:00",
    materials: [],
    learnText: "Desarrolla habilidades físicas y trabajo en equipo.",
  },
  {
    id: 4,
    title: "Música y ritmo",
    description: "Descubre el poder de la música y aprende a tocar instrumentos.",
    imageUrl: "https://www.shutterstock.com/image-photo/children-learn-music-instruments-school-260nw-1662074747.jpg",
    location: "Sala de música",
    date: "2025-11-18",
    time: "14:00",
    materials: ["Instrumento musical propio (opcional)"],
    learnText: "Aprenderás ritmos y canciones sencillas.",
  },
  {
    id: 5,
    title: "Dibujo y pintura",
    description: "Explora tu creatividad a través de técnicas de dibujo y color.",
    imageUrl: "https://img.freepik.com/foto-gratis/ninos-aprendiendo-pintar-clase-arte_23-2149079494.jpg",
    location: "Aula de arte",
    date: "2025-11-20",
    time: "11:00",
    materials: ["Lápiz", "Colores", "Cuaderno de dibujo"],
    learnText: "",
  },
];

export default function PublicWorkshopsPage() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleEnroll = (workshop: Workshop) => {
    alert(`Inscrito en: ${workshop.title}`);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? workshops.length - 3 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= workshops.length - 3 ? 0 : prev + 1
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
        <div className="relative flex items-center justify-center">
          {/* Botón Anterior */}
          <button
            onClick={prevSlide}
            className="absolute left-0 bg-white rounded-full shadow p-2 hover:bg-gray-100 z-20"
          >
            ◀
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center w-full">
            {visibleWorkshops.map((workshop) => (
              <div
                key={workshop.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden w-[320px] sm:w-[360px] flex flex-col border border-gray-200"
              >
                <div className="h-[220px]">
                  <img
                    src={workshop.imageUrl}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex flex-col items-start">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {workshop.title}
                  </h3>
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
          <button
            onClick={nextSlide}
            className="absolute right-0 bg-white rounded-full shadow p-2 hover:bg-gray-100 z-20"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedWorkshop && (
        <WorkshopDetailsModal
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  );
}