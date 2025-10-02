import { useState } from "react";
import asofondo from "../../../assets/asofondo.jpg";
import { WorkshopDetailsModal } from "../../Workshops/Pages/WorkshopDetailsModal"; // 👈 tu modal

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
    description:
      "Sumérgete en el mundo de la creatividad con nuestro Taller de Artes Prácticas...",
    imageUrl:
      "https://analiagattone.com.ar/wp-content/uploads/2021/11/taller-de-arte-adultos05.jpg",
    location: "San José, Costa Rica",
    date: "15 de Octubre",
    time: "3:00 PM",
    objectives: ["Desarrollar creatividad", "Usar diferentes técnicas"],
    materials: ["Pinceles", "Lienzos", "Acrílicos"],
    learnText: "Aprenderás a expresarte mediante el arte práctico."
  },
  {
    id: 2,
    title: "Sabor y sazón en la cocina",
    description:
      "¡Despierta tu chef interior y únete a nuestro Taller de Cocina!...",
    imageUrl:
      "https://i0.wp.com/foodandpleasure.com/wp-content/uploads/2024/05/talleres-de-cocina-en-la-cdmx-taller-gastronomico.jpg?fit=1080%2C1080&ssl=1a",
    location: "Heredia",
    date: "20 de Octubre",
    time: "5:00 PM",
    objectives: ["Aprender nuevas recetas", "Usar especias correctamente"],
    materials: ["Delantal", "Ingredientes básicos"],
    learnText: "Descubrirás técnicas para mejorar tus platillos."
  },
  {
    id: 3,
    title: "Deportes",
    description:
      "¡Activa tu cuerpo y tu mente en nuestro Taller de Deporte!...",
    imageUrl:
      "https://s3.us-east-2.amazonaws.com/img2.eltipografo.cl/media/2025/01/472530498_18150627061349449_6245436770163400317_n.jpg",
    location: "Alajuela",
    date: "25 de Octubre",
    time: "9:00 AM",
    objectives: ["Mejorar condición física", "Trabajar en equipo"],
    materials: ["Ropa deportiva", "Agua"],
    learnText: "Fortalecerás cuerpo y mente con actividades deportivas."
  }
];

export default function PublicWorkshopsPage() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleEnroll = (workshop: Workshop) => {
    alert(`Inscrito en: ${workshop.title}`);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? workshops.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === workshops.length - 1 ? 0 : prev + 1
    );
  };

  const workshop = workshops[currentIndex];

  return (
    <div
      className="relative py-10 bg-cover bg-center bg-no-repeat min-h-screen"
      style={{ backgroundImage: `url(${asofondo})` }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10">
        <h2 className="text-white text-4xl font-bold sm:text-5xl lg:text-6xl text-center tracking-wide mt-10 mb-12">
          Nuestros Talleres
        </h2>

        <div className="relative flex items-center justify-center">
          {/* Botón Anterior */}
          <button
            onClick={prevSlide}
            className="absolute left-30 bg-white rounded-full shadow p-2 hover:bg-gray-100 z-20"
          >
            ◀
          </button>

          {/* Card con diseño fijo (imagen SIEMPRE a la izquierda) */}
          <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-2xl overflow-hidden w-[90%] md:w-[850px] min-h-[350px] border border-gray-200">
            {/* Imagen izquierda */}
            <div className="md:w-1/2 w-full h-full">
              <img
                src={workshop.imageUrl}
                alt={workshop.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Contenido derecho */}
            <div className="p-6 md:w-1/2 w-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {workshop.title}
              </h3>
              <p className="text-gray-700 text-justify mb-4">
                {workshop.description}
              </p>
              <button
                onClick={() => setSelectedWorkshop(workshop)}
                className="bg-orange-500 text-white px-5 py-2 rounded-full border hover:bg-orange-600 self-start"
              >
                Ver más
              </button>
            </div>
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={nextSlide}
            className="absolute right-30 bg-white rounded-full shadow p-2 hover:bg-gray-100 z-20"
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
