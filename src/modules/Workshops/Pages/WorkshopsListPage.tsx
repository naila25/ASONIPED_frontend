import React, { useEffect, useState } from 'react';
import { getAllWorkshops } from '../Services/workshopService';
import type { Workshop } from '../Types/workshop';
import { WorkshopCard } from '../Components/WorkshopCard';
import WorkshopCreateForm from './WorkshopCreateForm';

const WorkshopOptionsPage: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  useEffect(() => {
    getAllWorkshops()
      .then(setWorkshops)
      .catch(err => console.error('Error cargando talleres:', err));
  }, []);

  const handleCreated = (newWorkshop: Workshop) => {
    setWorkshops(prev => [newWorkshop, ...prev]);
  };

  // Si quieres mostrar detalles al hacer click en la tarjeta, puedes usar esta función:
  const handleSelect = (workshop: Workshop) => {
    alert(`Taller seleccionado: ${workshop.titulo}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Opciones de Talleres</h2>
      <WorkshopCreateForm onCreated={handleCreated} />

      <div className="flex flex-wrap gap-4">
        {workshops.length === 0 ? (
          <span className="text-gray-500">No hay talleres registrados aún.</span>
        ) : (
          workshops.map(w => (
            <WorkshopCard key={w.id} workshop={w} onSelect={handleSelect} />
          ))
        )}
      </div>
    </div>
  );
};

export default WorkshopOptionsPage;