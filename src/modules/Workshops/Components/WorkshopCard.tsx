import type { Workshop } from '../Types/workshop';
import { getAPIBaseURLSync } from '../../../shared/Services/config';

interface Props {
  workshop: Workshop;
  onSelect: (workshop: Workshop) => void;
}

export const WorkshopCard = ({ workshop, onSelect }: Props) => {
  const displayImageUrl = (() => {
    const originalUrl = workshop.imagen;
    if (!originalUrl) return '';
    if (originalUrl.startsWith('blob:')) return '';
    if (originalUrl.startsWith('http')) return originalUrl;
    return `${getAPIBaseURLSync()}${originalUrl}`;
  })();

  return (
    <div
      onClick={() => onSelect(workshop)}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer border border-neutral-200"
    >
      {displayImageUrl ? (
        <img
          src={displayImageUrl}
          alt={workshop.titulo}
          className="w-full h-48 object-cover rounded-t-lg flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const placeholder = target.parentElement?.querySelector(
              '.image-placeholder'
            ) as HTMLElement;
            if (placeholder) placeholder.classList.remove('hidden');
          }}
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            const placeholder = target.parentElement?.querySelector(
              '.image-placeholder'
            ) as HTMLElement;
            if (placeholder) placeholder.classList.add('hidden');
          }}
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-t-lg image-placeholder">
          <span>Imagen no disponible</span>
        </div>
      )}

      {/* Placeholder div - shown when image fails to load */}
      <div className="hidden w-full h-48 bg-gray-200 items-center justify-center text-gray-500 text-sm rounded-t-lg image-placeholder">
        <span>Imagen no disponible</span>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800">
          {workshop.titulo}
        </h3>

        {workshop.descripcion && (
          <p className="text-neutral-700 text-sm mb-4 line-clamp-3 flex-grow">
            {workshop.descripcion}
          </p>
        )}

        <div className="flex flex-col text-sm text-neutral-700 space-y-2 flex-shrink-0">
          {workshop.fecha && <span>Fecha: {workshop.fecha}</span>}
          {workshop.hora && <span>Hora: {workshop.hora}</span>}
          {workshop.ubicacion && <span>Ubicación: {workshop.ubicacion}</span>}
          {workshop.capacidad !== undefined && (
            <span>Capacidad: {workshop.capacidad}</span>
          )}
          {workshop.materiales && workshop.materiales.length > 0 && (
            <span>
              Materiales:{' '}
              {Array.isArray(workshop.materiales)
                ? workshop.materiales.join(', ')
                : workshop.materiales}
            </span>
          )}
          {workshop.aprender && (
            <span>¿Qué aprenderás?: {workshop.aprender}</span>
          )}
        </div>
      </div>
    </div>
  );
};