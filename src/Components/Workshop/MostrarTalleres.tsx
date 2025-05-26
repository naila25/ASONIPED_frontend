

import React, { useState } from 'react';
import WorkshopCard from '../Workshop/WorshopCard';
import WorkshopDetails from '../Workshop/WorshopDetails';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const workshops = [
  {
    id: 1,
    name: 'Trabajo Social',
    description: 'Aprende sobre la intervención y apoyo en comunidades y grupos vulnerables.',
    objectives: ['Comprender el rol del trabajador social', 'Desarrollar habilidades de intervención', 'Fomentar la empatía y el trabajo en equipo'],
    materials: ['Cuaderno', 'Bolígrafo', 'Material de lectura'],
    learnings: 'Desarrollarás habilidades para intervenir y apoyar a personas y comunidades en situación de vulnerabilidad.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Flickr_-_Official_U.S._Navy_Imagery_-_Pacific_Partnership_2012_visits_Vietnam._%281%29.jpg' // Imagen sugerida: personas conversando o ayudando
  },
  {
    id: 2,
    name: 'Terapia Ocupacional',
    description: 'Descubre técnicas para mejorar la calidad de vida de las personas a través de la ocupación.',
    objectives: ['Identificar actividades terapéuticas', 'Aplicar técnicas de rehabilitación', 'Promover la autonomía'],
    materials: ['Ropa cómoda', 'Material didáctico', 'Cuaderno'],
    learnings: 'Aprenderás a diseñar y aplicar actividades que favorecen la rehabilitación y autonomía de las personas.',
    image: 'https://cmuch.edu.mx/blog/wp-content/uploads/2023/07/TO-EJEMPLO2-GRANDE-1200x797.png' // Imagen sugerida: terapia física o actividades de rehabilitación
  },
  {
    id: 3,
    name: 'Medio Ambiente',
    description: 'Conoce la importancia del cuidado ambiental y cómo puedes contribuir.',
    objectives: ['Reconocer problemas ambientales', 'Promover el reciclaje', 'Fomentar el uso responsable de recursos'],
    materials: ['Botella reutilizable', 'Guantes', 'Cuaderno'],
    learnings: 'Serás capaz de identificar y proponer soluciones a problemas ambientales en tu entorno.',
    image: 'https://uh.gsstatic.es/sfAttachPlugin/getCachedContent/id/2867797/width/425/height/284/crop/1' // Imagen sugerida: naturaleza, reciclaje o plantas
  },
  {
    id: 4,
    name: 'Agricultura',
    description: 'Aprende técnicas básicas de cultivo y producción agrícola sostenible.',
    objectives: ['Conocer tipos de cultivos', 'Aplicar técnicas de siembra', 'Promover la agricultura sostenible'],
    materials: ['Guantes', 'Herramientas de jardín', 'Cuaderno'],
    learnings: 'Podrás iniciar tu propio huerto y comprender la importancia de la agricultura sostenible.',
    image: 'https://www.larepublica.net/storage/images/2022/03/14/20220314100943.agricultura.x2.jpg' // Imagen sugerida: campo, siembra o herramientas agrícolas
  },
  {
    id: 5,
    name: 'Canva',
    description: 'Domina la herramienta Canva para crear diseños gráficos atractivos.',
    objectives: ['Crear presentaciones', 'Diseñar publicaciones para redes sociales', 'Utilizar plantillas'],
    materials: ['Laptop', 'Acceso a internet', 'Cuenta de Canva'],
    learnings: 'Serás capaz de crear diseños profesionales para diferentes propósitos usando Canva.',
    image: 'https://content-management-files.canva.com/1c13d213-d8c5-4e8f-aaf7-e565216bd6d7/og_image_free.png' // Imagen sugerida: logo de Canva o diseño gráfico en pantalla
  },
  {
    id: 6,
    name: 'Deportes',
    description: 'Participa en actividades deportivas para mejorar tu salud y trabajo en equipo.',
    objectives: ['Fomentar la actividad física', 'Desarrollar habilidades deportivas', 'Promover el trabajo en equipo'],
    materials: ['Ropa deportiva', 'Botella de agua', 'Toalla'],
    learnings: 'Mejorarás tu condición física y aprenderás la importancia del deporte en la vida diaria.',
    image: 'https://www.anahuac.mx/mexico/sites/default/files/styles/webp/public/noticias/Foro-virtual-El-deporte-dentro-y-fuera-de-la-cancha-2.jpg.webp?itok=MW_QtnIy' // Imagen sugerida: personas haciendo deporte, balones, etc.
  },
  {
    id: 7,
    name: 'Cocina',
    description: 'Aprende recetas básicas y técnicas culinarias para una alimentación saludable.',
    objectives: ['Conocer ingredientes básicos', 'Aplicar técnicas de cocina', 'Fomentar la alimentación saludable'],
    materials: ['Delantal', 'Utensilios de cocina', 'Ingredientes'],
    learnings: 'Podrás preparar platillos sencillos y nutritivos para tu día a día.',
    image: 'https://titulae.es/wp-content/uploads/2023/11/jefe-de-cocina-funciones.jpg' // Imagen sugerida: cocina, chef, alimentos frescos
  },
  {
    id: 8,
    name: 'Artes Industriales',
    description: 'Explora técnicas de trabajo en madera, metal y otros materiales.',
    objectives: ['Identificar herramientas', 'Aplicar técnicas básicas', 'Fomentar la creatividad'],
    materials: ['Guantes', 'Materiales de trabajo', 'Cuaderno'],
    learnings: 'Desarrollarás habilidades prácticas en el manejo de materiales y herramientas industriales.',
    image: 'https://images.pexels.com/photos/5974283/pexels-photo-5974283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' // Imagen sugerida: taller, herramientas, madera o metal
  }
];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 2 }
    },
    {
      breakpoint: 600,
      settings: { slidesToShow: 1 }
    }
  ]
};

const MostrarTalleres: React.FC = () => {
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  return (
    <div>
      <h1 className="text-orange-600 text-center text-3xl font-bold mb-6">Talleres</h1>
      <Slider {...settings}>
        {workshops.map(workshop => (
          <div key={workshop.id}>
            <WorkshopCard
              workshop={workshop}
              onWorkshopClick={setSelectedWorkshop}
            />
          </div>
        ))}
      </Slider>
      {selectedWorkshop && (
        <WorkshopDetails
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
        />
      )}
    </div>
  );
};

export default MostrarTalleres;