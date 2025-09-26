import { useState } from "react";
import asofondo from "../../../assets/asofondo.jpg";
import { WorkshopDetailsModal } from "../../Workshops/Pages/WorkshopDetailsModal"; // 👈 importa tu modal

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
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null
  );

  const handleEnroll = (workshop: Workshop) => {
    alert(`Inscrito en: ${workshop.title}`);
  };

  return (
    <div
      className="relative py-10 bg-cover bg-center bg-no-repeat min-h-screen"
      style={{ backgroundImage: `url(${asofondo})` }}
    >
      <div className="absolute inset-0 bg-blue-900/70"></div>

      <div className="relative z-10">
        <h2 className="text-white text-4xl font-bold sm:text-5xl lg:text-6xl text-center tracking-wide mt-10 mb-12">
          Nuestros Talleres
        </h2>

        <div className="flex flex-col gap-10 items-center">
          {workshops.map((workshop, index) => (
            <div
              key={workshop.id}
              className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg overflow-hidden w-[90%] md:w-[650px] min-h-[260px]"
            >
              {/* Imagen izquierda o derecha */}
              {index % 2 === 0 ? (
                <>
                  <div className="md:w-1/2 w-full">
                    <img
                      src={workshop.imageUrl}
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-1/2 w-full">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {workshop.title}
                    </h3>
                    <p className="text-gray-700 text-justify mb-4">
                      {workshop.description}
                    </p>
                    <button
                      onClick={() => setSelectedWorkshop(workshop)}
                      className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Ver más
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 md:w-1/2 w-full">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {workshop.title}
                    </h3>
                    <p className="text-gray-700 text-justify mb-4">
                      {workshop.description}
                    </p>
                    <button
                      onClick={() => setSelectedWorkshop(workshop)}
                      className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Ver más
                    </button>
                  </div>
                  <div className="md:w-1/2 w-full">
                    <img
                      src={workshop.imageUrl}
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
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
