import { useState } from 'react';
import VolunteerModal from './VolunteerModal';

interface VolunteerCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
}

const VolunteerCard = ({
  id,
  title,
  description,
  imageUrl,
  date,
  location,
}: VolunteerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="mr-4">{date}</span>
            <span>{location}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className=" text-white w-full bg-gradient-to-r from-orange-500 to-orange-800 py-2 rounded hover:bg-orange-600 transition-colors hover:opacity-80 "
          >
            Ver más
          </button>
        </div>
      </div>

      <VolunteerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        volunteer={{
          id,
          title,
          description,
          imageUrl,
          date,
          location,
        }}
      />
    </>
  );
};

export default VolunteerCard;