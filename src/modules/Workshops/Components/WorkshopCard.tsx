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
        src={(() => {
          const originalUrl = workshop.imagen;
          if (!originalUrl) return '';
          if (originalUrl.startsWith('blob:')) return '';
          if (originalUrl.startsWith('http')) return originalUrl;
          return `http://localhost:3000${originalUrl}`;
        })()}
        alt={workshop.titulo}
        className="w-full h-44 object-cover rounded-lg mb-4"
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
      {/* Placeholder div - shown when no image or image fails to load */}
      <div className={`w-full h-44 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg mb-4 image-placeholder ${workshop.imagen && !workshop.imagen.startsWith('blob:') ? 'hidden' : ''}`}>
        <span>Imagen no disponible</span>
      </div>
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
      {workshop.materiales && workshop.materiales.length > 0 && (
        <p className="text-sm text-gray-500">
          Materiales: {Array.isArray(workshop.materiales) ? workshop.materiales.join(', ') : workshop.materiales}
        </p>
      )}
      {workshop.aprender && (
        <p className="text-sm text-gray-500">¿Qué aprenderás?: {workshop.aprender}</p>
      )}
    </div>
  );
};