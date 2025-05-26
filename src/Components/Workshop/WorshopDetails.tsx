import React from 'react';
import { useNavigate } from '@tanstack/react-router';

interface WorkshopDetailsProps {
  workshop: {
    id: number;
    name: string;
    description: string;
    objectives: string[];
    materials: string[];
    learnings: string;
  } | null;
  onClose: () => void;
}

const WorkshopDetails: React.FC<WorkshopDetailsProps> = ({ workshop, onClose }) => {
  const navigate = useNavigate();

  if (!workshop) return null;

  const handleMatricula = () => {
    const path = `/matricula-taller/${workshop.id}` as const;
    navigate({ to: path });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-neutral-400 hover:text-orange-600 transition"
          aria-label="Cerrar"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-center mb-4 text-orange-700">{workshop.name}</h2>
        <p className="text-neutral-600 text-lg mb-6 text-center">{workshop.description}</p>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-orange-700 mb-2">Objetivos:</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1">
              {workshop.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-orange-700 mb-2">Materiales:</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1">
              {workshop.materials.map((material, index) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-orange-700 mb-2">¿Qué aprenderás?</h3>
            <p className="text-neutral-700">{workshop.learnings}</p>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            onClick={handleMatricula}
          >
            Matricular taller
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetails;
