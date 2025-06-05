// PublicWorkshopsPage.tsx
import { useState } from 'react';
import type { Workshop } from './types/workshop';
import { useSelectedWorkshop } from './hooks/useSelectedWorkshop';
import { WorkshopCarousel } from './components/WorkshopCarousel';
import { WorkshopDetailsModal } from './components/WorkshopDetailsModal';
import { FormularioMatricula } from './FormularioMatricula';

const talleres: Workshop[] = [
  {
    id: 't1',
    title: 'Trabajo Social',
    description: 'Aprende sobre la intervención y apoyo en comunidades y grupos vulnerables.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Flickr_-_Official_U.S._Navy_Imagery_-_Pacific_Partnership_2012_visits_Vietnam._%281%29.jpg',
    objectives: ['Comprender el rol del trabajador social', 'Desarrollar habilidades de intervención', 'Fomentar la empatía y el trabajo en equipo'],
    materials: ['Cuaderno', 'Bolígrafo', 'Material de lectura'],
    learnText: 'Desarrollarás habilidades para intervenir y apoyar a personas y comunidades en situación de vulnerabilidad.',
  },
  {
    id: 't2',
    title: 'Terapia Ocupacional',
    description: 'Descubre técnicas para mejorar la calidad de vida de las personas a través de la ocupación.',
    imageUrl: 'https://cmuch.edu.mx/blog/wp-content/uploads/2023/07/TO-EJEMPLO2-GRANDE-1200x797.png',
    objectives: ['Identificar actividades terapéuticas', 'Aplicar técnicas de rehabilitación', 'Promover la autonomía'],
    materials: ['Ropa cómoda', 'Material didáctico', 'Cuaderno'],
    learnText: 'Aprenderás a diseñar y aplicar actividades que favorecen la rehabilitación y autonomía de las personas.',
  },
  {
    id: 't3',
    title: 'Medio Ambiente',
    description: 'Conoce la importancia del cuidado ambiental y cómo puedes contribuir.',
    imageUrl: 'https://uh.gsstatic.es/sfAttachPlugin/getCachedContent/id/2867797/width/425/height/284/crop/1',
    objectives: ['Reconocer problemas ambientales', 'Promover el reciclaje', 'Fomentar el uso responsable de recursos'],
    materials: ['Botella reutilizable', 'Guantes', 'Cuaderno'],
    learnText: 'Serás capaz de identificar y proponer soluciones a problemas ambientales en tu entorno.',
  },
  {
    id: 't4',
    title: 'Agricultura',
    description: 'Aprende técnicas básicas de cultivo y producción agrícola sostenible.',
    imageUrl: 'https://www.larepublica.net/storage/images/2022/03/14/20220314100943.agricultura.x2.jpg',
    objectives: ['Conocer tipos de cultivos', 'Aplicar técnicas de siembra', 'Promover la agricultura sostenible'],
    materials: ['Guantes', 'Herramientas de jardín', 'Cuaderno'],
    learnText: 'Podrás iniciar tu propio huerto y comprender la importancia de la agricultura sostenible.',
  },
  {
    id: 't5',
    title: 'Canva',
    description: 'Domina la herramienta Canva para crear diseños gráficos atractivos.',
    imageUrl: 'https://content-management-files.canva.com/1c13d213-d8c5-4e8f-aaf7-e565216bd6d7/og_image_free.png',
    objectives: ['Crear presentaciones', 'Diseñar publicaciones para redes sociales', 'Utilizar plantillas'],
    materials: ['Laptop', 'Acceso a internet', 'Cuenta de Canva'],
    learnText: 'Serás capaz de crear diseños profesionales para diferentes propósitos usando Canva.',
  },
  {
    id: 't6',
    title: 'Deportes',
    description: 'Participa en actividades deportivas para mejorar tu salud y trabajo en equipo.',
    imageUrl: 'https://www.anahuac.mx/mexico/sites/default/files/styles/webp/public/noticias/Foro-virtual-El-deporte-dentro-y-fuera-de-la-cancha-2.jpg.webp?itok=MW_QtnIy',
    objectives: ['Fomentar la actividad física', 'Desarrollar habilidades deportivas', 'Promover el trabajo en equipo'],
    materials: ['Ropa deportiva', 'Botella de agua', 'Toalla'],
    learnText: 'Mejorarás tu condición física y aprenderás la importancia del deporte en la vida diaria.',
  },
  {
    id: 't7',
    title: 'Cocina',
    description: 'Aprende recetas básicas y técnicas culinarias para una alimentación saludable.',
    imageUrl: 'https://titulae.es/wp-content/uploads/2023/11/jefe-de-cocina-funciones.jpg',
    objectives: ['Conocer ingredientes básicos', 'Aplicar técnicas de cocina', 'Fomentar la alimentación saludable'],
    materials: ['Delantal', 'Utensilios de cocina', 'Ingredientes'],
    learnText: 'Podrás preparar platillos sencillos y nutritivos para tu día a día.',
  },
  {
    id: 't8',
    title: 'Artes Industriales',
    description: 'Explora técnicas de trabajo en madera, metal y otros materiales.',
    imageUrl: 'https://images.pexels.com/photos/5974283/pexels-photo-5974283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    objectives: ['Identificar herramientas', 'Aplicar técnicas básicas', 'Fomentar la creatividad'],
    materials: ['Guantes', 'Materiales de trabajo', 'Cuaderno'],
    learnText: 'Desarrollarás habilidades prácticas en el manejo de materiales y herramientas industriales.',
  },
];


export default function PublicWorkshopsPage() {
  const {
    selectedWorkshop,
    selectWorkshop,
    clearWorkshop,
  } = useSelectedWorkshop();

  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <WorkshopCarousel workshops={talleres} onSelect={handleOpenDetails} />
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
