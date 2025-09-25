// PublicWorkshopsPage.tsx
import { useState } from "react";

type Workshop = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
};

const workshops: Workshop[] = [
  {
    id: 1,
    title: "Artes Prácticas",
    description:
      "Sumérgete en el mundo de la creatividad con nuestro Taller de Artes Prácticas. Aquí podrás explorar diferentes técnicas y materiales para dar vida a tus ideas. Desde la pintura y el dibujo hasta la escultura y la artesanía, te brindaremos las herramientas y el acompañamiento para que desarrolles tu talento artístico. Este taller es ideal para relajarte, expresarte y descubrir tu lado más creativo, creando obras únicas con tus propias manos.",
    imageUrl: "https://analiagattone.com.ar/wp-content/uploads/2021/11/taller-de-arte-adultos05.jpg",
  },
  {
    id: 2,
    title: "sabor y sazón en la cocina",
    description:
      "¡Despierta tu chef interior y únete a nuestro Taller de Cocina! En este espacio, no solo aprenderás a preparar deliciosos platillos, sino que también descubrirás los secretos de los ingredientes, las técnicas culinarias y la creatividad en la cocina. Desde recetas básicas hasta elaboraciones más complejas, te guiaremos paso a paso para que te conviertas en un experto culinario. ¡Prepárate para sorprender a tu familia y amigos con tus nuevas habilidades!",
    imageUrl: "https://i0.wp.com/foodandpleasure.com/wp-content/uploads/2024/05/talleres-de-cocina-en-la-cdmx-taller-gastronomico.jpg?fit=1080%2C1080&ssl=1a",
  },
  {
    id: 3,
    title: "Deportes",
    description:
      "¡Activa tu cuerpo y tu mente en nuestro Taller de Deporte! Este es el lugar perfecto para mejorar tu condición física, aprender nuevas disciplinas deportivas y trabajar en equipo. Sea cual sea tu nivel, encontrarás un ambiente motivador donde podrás desarrollar fuerza, agilidad, resistencia y coordinación. Más allá de la actividad física, este taller te ayudará a liberar el estrés, mejorar tu salud y fortalecer tu disciplina.",
    imageUrl: "https://s3.us-east-2.amazonaws.com/img2.eltipografo.cl/media/2025/01/472530498_18150627061349449_6245436770163400317_n.jpg",
  },
];

export default function PublicWorkshopsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? workshops.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === workshops.length - 1 ? 0 : prev + 1
    );
  };

  const workshop = workshops[currentIndex];

  return (
    <div className="py-10">
      <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide mt-10 mb-8">
        Nuestros talleres
      </h2>

      <div className="relative flex items-center justify-center">
        {/* Botón Anterior */}
        <button
          onClick={prevSlide}
          className="absolute left-0 bg-white rounded-full shadow p-2 hover:bg-gray-100"
        >
          ◀
        </button>

        {/* Card grande */}
        <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 p-8 w-[1000px] min-h-[450px]">
          {/* Imagen izquierda */}
          <img
            src={workshop.imageUrl}
            alt={workshop.title}
            className="w-82 h-85 object-cover rounded-md mr-6"
          />

          {/* Contenido derecho */}
          <div className="flex flex-col flex-1">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">{workshop.title}</h3>
            <p className="text-neutral-700 mt-2 text-justify leading-relaxed flex-1">{workshop.description}</p>
            <a
             className="mt-6 self-center bg-blue-600 text-white px-6 py-2 rounded-2xl hover:bg-blue-700">
              Más información
            </a>
          </div>
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={nextSlide}
          className="absolute right-0 bg-white rounded-full shadow p-2 hover:bg-gray-100"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
