import React, { useState } from "react";
import { FormularioMatricula } from "./FormularioMatricula";
import { WorkshopDetailsModal } from "../Components/WorkshopDetailsModal";
import type { Workshop } from "../Services/workshop";

// Ejemplo de talleres, reemplaza por tu fuente de datos real
const talleres: Workshop[] = [
  {
    id: "1",
    title: "Taller de Pintura",
    description: "Aprende técnicas básicas y avanzadas de pintura.",
    imageUrl: "",
    objectives: [
      "Desarrollar la creatividad",
      "Aprender técnicas de acuarela",
      "Mejorar la expresión artística",
    ],
    materials: ["Pinceles", "Acuarelas", "Lienzo"],
    learnText: "Al finalizar, podrás crear tus propias obras de arte.",
  },
  {
    id: "2",
    title: "Taller de Música",
    description: "Iníciate en el mundo de la música y los instrumentos.",
    imageUrl: "",
    objectives: [
      "Conocer instrumentos musicales",
      "Aprender a leer partituras",
      "Desarrollar el oído musical",
    ],
    materials: ["Instrumento musical propio (opcional)", "Cuaderno"],
    learnText: "Podrás interpretar piezas sencillas y comprender la teoría básica.",
  },
];

const TalleresPage: React.FC = () => {
  const [showMatricula, setShowMatricula] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleOpenMatricula = () => setShowMatricula(true);
  const handleCloseMatricula = () => setShowMatricula(false);

  const handleShowDetails = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setShowDetails(true);
  };
  const handleCloseDetails = () => {
    setSelectedWorkshop(null);
    setShowDetails(false);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-8 text-orange-700">
        Talleres Disponibles
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {talleres.map((taller) => (
          <div
            key={taller.id}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-semibold text-orange-600 mb-2">{taller.title}</h2>
              <p className="text-neutral-700 mb-4">{taller.description}</p>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                onClick={() => handleShowDetails(taller)}
              >
                Ver detalles
              </button>
              <button
                className="border border-orange-500 text-orange-600 px-4 py-2 rounded hover:bg-orange-50 transition"
                onClick={handleOpenMatricula}
              >
                Matricularme
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedWorkshop && (
        <WorkshopDetailsModal 
          workshop={selectedWorkshop} 
          onClose={handleCloseDetails}
          onEnroll={handleOpenMatricula}
        />
      )}

      {/* Modal de matrícula */}
      {showMatricula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl p-8">
            <button
              onClick={handleCloseMatricula}
              className="absolute top-4 right-4 text-2xl text-neutral-400 hover:text-orange-600 transition"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <FormularioMatricula 
              workshopId={selectedWorkshop?.id || ''}
              onSuccess={handleCloseMatricula}
              onCancel={handleCloseMatricula}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TalleresPage;