import { useState, useEffect } from 'react';
import VolunteerCard from './VolunteerCard';
import { Link } from '@tanstack/react-router';
import { fetchVolunteers } from '../../Utils/fetchVolunteers';
import type { VolunteerOption } from '../../types/volunteer'

const VolunteersSection = () => {
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);

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

  const latestVolunteers = [...volunteers].slice(-3).reverse();

  return (
    <section className="py-25">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-orange-500 text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking wide py-6">
            Oportunidades de Voluntariado
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Únete a nuestra comunidad y ayuda a crear un impacto positivo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestVolunteers.map((option) => (
            <VolunteerCard key={option.id} {...option} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/volunteers"
            className="inline-block bg-gradient-to-r from-orange-500 to-orange-800 text-white py-2 px-6 rounded hover:bg-orange-600 transition-colors"
          >
            Ver todas las oportunidades
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VolunteersSection;


