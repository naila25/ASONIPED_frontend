// PublicWorkshopsPage.tsx
import { useState, useEffect } from 'react';
import type { Workshop } from './types/workshop';
import { useSelectedWorkshop } from './hooks/useSelectedWorkshop';
import { WorkshopCarousel } from './components/WorkshopCarousel';
import { WorkshopDetailsModal } from './components/WorkshopDetailsModal';
import { FormularioMatricula } from './FormularioMatricula';
import { getAllWorkshops } from './services/workshopService';

export default function PublicWorkshopsPage() {
  const {
    selectedWorkshop,
    selectWorkshop,
    clearWorkshop,
  } = useSelectedWorkshop();

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getAllWorkshops()
      .then(setWorkshops)
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDetails = (workshop: Workshop) => {
    selectWorkshop(workshop);
  };

  const handleMatricular = (workshop: Workshop) => {
    selectWorkshop(workshop); 
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    clearWorkshop();
    alert('¡Formulario enviado con éxito!');
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  if (loading) return <div className="text-center py-10">Cargando talleres...</div>;

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <WorkshopCarousel workshops={workshops} onSelect={handleOpenDetails} />
      </div>

      {selectedWorkshop && !showForm && (
        <WorkshopDetailsModal
          workshop={selectedWorkshop}
          onClose={clearWorkshop}
          onEnroll={handleMatricular}
        />
      )}

      {selectedWorkshop && showForm && (
        <FormularioMatricula
          workshopId={selectedWorkshop.id}
          onSuccess={handleSuccess}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}