import type { Workshop } from '../Types/workshop';

interface Props {
  workshop: Workshop;
  onSelect: (workshop: Workshop) => void;
}

export const WorkshopCard = ({ workshop, onSelect }: Props) => {
  return (
    <div
      onClick={() => onSelect(workshop)}
      className="bg-white border border-neutral-200 rounded-xl shadow-md p-6 cursor-pointer hover:scale-105 transition-transform text-center"
    >
      <img
        src={workshop.imagen || 'https://via.placeholder.com/320x180?text=Sin+imagen'}
        alt={workshop.titulo}
        className="w-full h-44 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800">{workshop.titulo}</h3>
      {workshop.descripcion && (
        <p className="text-gray-600 mt-2">{workshop.descripcion}</p>
      )}
      {workshop.fecha && (
        <p className="text-sm text-gray-500">Fecha: {workshop.fecha}</p>
      )}
      {workshop.hora && (
        <p className="text-sm text-gray-500">Hora: {workshop.hora}</p>
      )}
      {workshop.ubicacion && (
        <p className="text-sm text-gray-500">Ubicación: {workshop.ubicacion}</p>
      )}
      {workshop.capacidad !== undefined && (
        <p className="text-sm text-gray-500">Capacidad: {workshop.capacidad}</p>
      )}
      {workshop.materiales && (
        <p className="text-sm text-gray-500">Materiales: {workshop.materiales}</p>
      )}
      {workshop.aprender && (
        <p className="text-sm text-gray-500">¿Qué aprenderás?: {workshop.aprender}</p>
      )}
    </div>
  );
};