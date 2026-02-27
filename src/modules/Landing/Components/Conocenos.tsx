import asoniped from '../../../assets/asoniped.jpg'; 
import asoniped1 from '../../../assets/asoniped1.jpg'
import { Target, Eye, HeartHandshake, Users, Smile, Handshake, ShieldCheck, HandHeart, Scale } from "lucide-react"; 

const ConocenosSection = () => {
  return (
    <section className="relative">

      {/* HERO con imagen y título */}
      <div 
        className="relative h-[300px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${asoniped1})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-semibold text-white z-10 tracking-wide">
          Conócenos
        </h1>
      </div>

      {/* ¿Qué es ASONIPED? */}
      <div className="bg-white py-20 px-6 text-center">
        <h3 className="text-orange-600 text-3xl font-semibold mb-6">
          ¿Qué es ASONIPED?
        </h3>
        <p className="max-w-3xl mx-auto text-neutral-700 text-lg leading-relaxed">
          ASONIPED es una asociación sin fines de lucro que impulsa la inclusión y el desarrollo integral 
          de personas con discapacidad en la región de Nicoya, promoviendo proyectos educativos, recreativos y sociales.
        </p>
      </div>

      {/* ¿A Quiénes ayudamos? */}
      <div className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-10">
          <img
            src={asoniped}
            alt="A quiénes ayudamos"
            className="w-full lg:w-1/2 rounded-xl shadow-xl"
          />
          <div className="w-full lg:w-1/2 bg-white shadow-lg rounded-2xl p-8">
            <h3 className="text-orange-600 text-2xl font-semibold mb-4">
              ¿A quiénes ayudamos?
            </h3>
            <p className="text-neutral-700 text-lg leading-relaxed">
              Ayudamos a niños, jóvenes y adultos con diversas condiciones de discapacidad, brindándoles acceso a educación especializada, actividades integradoras y apoyo familiar.
            </p>
          </div>
        </div>
      </div>

      {/* Misión y Visión */}
      <div className="bg-white py-16 px-4">
        <h3 className="text-orange-600 text-3xl font-semibold mb-12 text-center">
          Propósito y futuro
        </h3>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-orange-600">
              <Target className="w-6 h-6" />
              <h4 className="text-2xl font-semibold">Misión</h4>
            </div>
            <p className="text-neutral-700">
              ASONIPED es una Organización No Gubernamental, sin fines de lucro, que brinda atención integral con la ayuda de nuestros colaboradores para mejorar la calidad de vida de las personas con discapacidad y sus familias, en el territorio de Nicoya, Hojancha y Nandayure.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-orange-600">
              <Eye className="w-6 h-6" />
              <h4 className="text-2xl font-semibold">Visión</h4>
            </div>
            <p className="text-neutral-700">
              Ser una organización de vanguardia en temas de discapacidad, en pro del desarrollo y participación integral de formación humana para nuestra población meta, que favorezca su plena inclusión como ciudadanos de pleno derecho. Siendo un modelo de nuevas prácticas e innovación tecnológica, con énfasis en el uso de tecnologías limpias.
            </p>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-orange-600 text-3xl font-semibold mb-6">
            Nuestros valores
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
            {[
              { name: 'Solidaridad', icon: HandHeart },
              { name: 'Empatía', icon: Smile },
              { name: 'Responsabilidad Social', icon: Users },
              { name: 'Honestidad', icon: Handshake },
              { name: 'Respeto', icon: HeartHandshake},
              { name: 'Tolerancia', icon: Scale },
              { name: 'Credibilidad', icon: ShieldCheck },
              { name: 'Inclusividad', icon: Users },
            ].map((valor, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center hover:shadow-xl transition-all"
              >
                <valor.icon className="w-8 h-8 text-orange-600 mb-3" />
                <p className="text-neutral-700 font-medium">{valor.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default ConocenosSection;