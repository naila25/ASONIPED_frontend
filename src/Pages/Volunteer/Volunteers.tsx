import { useEffect, useState } from 'react';
import { fetchVolunteers } from '../../Utils/fetchVolunteers';
import VolunteerCard from '../../Components/Volunteers/VolunteerCard';
import type  { VolunteerOption } from '../../types/volunteer';

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchVolunteers()
      .then(response => {
        if (response.error) {
          console.error(response.error);
          return;
        }
        setVolunteers(response.data);
      })
      .catch(console.error);
  }, []);

  const totalPages = Math.ceil(volunteers.length / itemsPerPage);
  const currentItems = volunteers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <main className="min-h-screen bg-black-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Oportunidades de 
              <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
                {" "}Voluntariado
              </span>
            </h1>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Explora todas las oportunidades disponibles y encuentra la que mejor se adapte a tus habilidades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentItems.map((vol) => (
              <VolunteerCard key={vol.id} {...vol} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                Anterior
              </button>
              <span className="text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </main>
      
    </>
  );
};

export default Volunteers; 