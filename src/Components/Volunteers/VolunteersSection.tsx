import { useState, useEffect } from 'react';
import VolunteerCard from './VolunteerCard';
import { Link } from '@tanstack/react-router';
import { fetchVolunteerOptions } from '../../Utils/fetchVolunteers';
import type { VolunteerOption } from '../../types/volunteer'

const VolunteersSection = () => {
  const [options, setOptions] = useState<VolunteerOption[]>([]);

  useEffect(() => {
    fetchVolunteerOptions()
      .then(options => setOptions(Array.isArray(options) ? options : []))
      .catch(console.error);
  }, []);

  const latestOptions = [...options].slice(-3).reverse();

  return (
    <section className="py-5">  {/* Espacio entre cada componente */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-orange-700 text-4xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking wide py-6">
            Oportunidades de
            <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
            {" "}
             Voluntariado
          </span>
          </h2>
          <p className="text-neutral-500 text-xl text-center lg:text-center py-6">
            Únete a nuestra comunidad y ayuda a crear un impacto positivo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestOptions.map((option) => (
            <VolunteerCard key={option.id} {...option} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/volunteers"
            className="inline-block bg-gradient-to-r from-orange-400 to-orange-700 text-white py-2 px-6 rounded  hover:bg-orange-800 transition-colors hover:opacity-90"
          >
            Ver todas las oportunidades
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VolunteersSection;


