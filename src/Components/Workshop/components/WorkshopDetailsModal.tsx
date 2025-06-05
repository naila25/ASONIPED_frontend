import type { Workshop } from "../types/workshop";

interface Props {
  workshop: Workshop;
  onClose: () => void;
  onEnroll: (workshop: Workshop) => void;
}

export const WorkshopDetailsModal = ({ workshop, onClose, onEnroll }: Props) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-orange-600 text-center mb-2">{workshop.title}</h2>
        <p className="text-center text-gray-600 mb-4">{workshop.description}</p>

        <div className="mb-4">
          <h3 className="text-orange-600 font-semibold">Objetivos:</h3>
          <ul className="list-disc list-inside text-gray-700">
            {workshop.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="text-orange-600 font-semibold">Materiales:</h3>
          <ul className="list-disc list-inside text-gray-700">
            {workshop.materials.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-orange-600 font-semibold">¿Qué aprenderás?</h3>
          <p className="text-gray-700">{workshop.learnText}</p>
        </div>

        <div className="text-center">
          <button
            onClick={() => onEnroll(workshop)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded"
          >
            Matricular taller
          </button>
        </div>
      </div>
    </div>
  );
};
