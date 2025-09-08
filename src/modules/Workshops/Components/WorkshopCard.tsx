import type { Workshop } from '../Services/workshop';

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
        src={workshop.imageUrl}
        alt={workshop.title}
        className="w-full h-44 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800">{workshop.title}</h3>
    </div>
  );
};
