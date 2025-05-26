import quienesSomosImg from "../../assets/quienessomos.png"; 
import { Link } from '@tanstack/react-router';
import { X } from 'lucide-react';

const ConocenosSection = () => {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto relative">
      <Link 
        to="/"
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-orange-100 transition-colors"
        aria-label="Cerrar página"
      >
        <X className="w-6 h-6 text-orange-600" />
      </Link>
     
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-16">Conócenos</h2>

     
      <div className="flex flex-col lg:flex-row items-center gap-10 mb-24">
        <img src={quienesSomosImg} alt="Quiénes somos" className="w-full lg:w-1/2 rounded-xl shadow-xl" />
        <div className="w-full lg:w-1/2">
          <h3 className="text-orange-600 text-2xl font-semibold mb-4"> ¿Qué es ASONIPED?</h3>
          <p className="text-neutral-700 text-lg">
            ASONIPED es una asociación sin fines de lucro que impulsa la inclusión y el desarrollo integral de personas con discapacidad en la región de Nicoya, promoviendo proyectos educativos, recreativos y sociales.
          </p>
        </div>
      </div>

      
      <div className="flex flex-col lg:flex-row-reverse items-center gap-10 mb-24">
        <img src={quienesSomosImg} alt="A quiénes ayudamos" className="w-full lg:w-1/2 rounded-xl shadow-xl" />
        <div className="w-full lg:w-1/2">
          <h3 className=" text-orange-600 text-2xl font-semibold mb-4"> ¿A Quiénes Ayudamos?</h3>
          <p className="text-neutral-700 text-lg">
            Ayudamos a niños, jóvenes y adultos con diversas condiciones de discapacidad, brindándoles acceso a educación especializada, actividades integradoras y apoyo familiar.
          </p>
        </div>
      </div>

      
      <div className="flex flex-col lg:flex-row gap-10 mb-16">
  {/* Misión */}
  <div className="lg:w-1/2 text-center lg:text-left">
    <h4 className="text-orange-600 text-2xl font-semibold mb-2 text-center">Misión</h4>
    <p className="text-neutral-700">
      ASONIPED es una Organización No Gubernamental, sin fines de lucro, que brinda atención integral con la ayuda de nuestros colaboradores para mejorar la calidad de vida de las personas con discapacidad y sus familias, en el territorio de Nicoya, Hojancha y Nandayure.
    </p>
  </div>

  {/* Visión */}
  <div className="lg:w-1/2 text-center lg:text-left">
    <h4 className="text-orange-600 text-2xl font-semibold mb-2 text-center">Visión</h4>
    <p className="text-neutral-700">
      Ser una organización de vanguardia en temas de discapacidad en pro del desarrollo y participación integral de formación humana para nuestra población meta, que favorezca su plena inclusión como ciudadanos de pleno derecho. Siendo un modelo de nuevas prácticas e innovación tecnológica, con énfasis en el uso de tecnologías limpias.
    </p>
  </div>
</div>


      <div className="text-center mb-8">
        <h3 className="text-orange-600 text-xl font-bold mb-2">NUESTROS VALORES</h3>
        <p className="max-w-2xl mx-auto text-neutral-700 mb-10">
          Nuestros valores que nos caracterizan y que nos ayudan a guiar nuestro camino, siempre con los pies bien puestos sobre la tierra y cerquita de la comunidad.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {['Solidaridad', 'Empatía', 'Responsabilidad Social', 'Honestidad', 'Respeto', 'Tolerancia', 'Credibilidad'].map((valor, index) => (
            <div key={index} className="bg-orange-300 text-white px-6 py-3 rounded-full text-lg font-medium">
              {valor}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConocenosSection;