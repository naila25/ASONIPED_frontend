
import React from 'react';

interface WorkshopCardProps {
  workshop: {
    id: number;
    name: string;
    image?: string;
  };
  onWorkshopClick: (workshop: any) => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, onWorkshopClick }) => {
  return (
    <div
      className="border border-neutral-200 rounded-xl p-6 m-2 text-center cursor-pointer transition-transform duration-200 shadow-md hover:scale-105 bg-white flex flex-col items-center min-w-[200px] max-w-xs"
      onClick={() => onWorkshopClick(workshop)}
    >
      {workshop.image && (
        <img
          src={workshop.image}
          alt={workshop.name}
          className="max-w-full h-auto rounded-lg mb-4 shadow"
        />
      )}
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">{workshop.name}</h3>
      {/* Puedes agregar una breve descripción aquí si lo deseas */}
    </div>
  );
};

export default WorkshopCard;