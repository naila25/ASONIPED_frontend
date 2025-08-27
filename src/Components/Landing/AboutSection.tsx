import quienesSomosImg from "../../assets/quienessomos.png";
import { Link } from '@tanstack/react-router';

const AboutSection = () => {
    return (
      <div className="flex flex-col items-center mt-20 tracking-wide lg:mt-32">
        <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide">
          Conoce Más Sobre  Nuestra Historia
        </h2>
        
        <div className="flex flex-col lg:flex-row items-center justify-center mt-10 gap-10">
          <div className="w-full lg:w-1/2 p-4">
            <img src={quienesSomosImg} alt="ASONIPED" className="rounded-xl shadow-2xl"/>
          </div>
          <div className="w-full lg:w-1/2 p-4 space-y-6">
            <p className="text-neutral-500 text-xl text-center lg:text-left py-6">
              Trabajamos incansablemente para promover la inclusión de personas con discapacidad en la región de Nicoya.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100/80 p-2 rounded-full">
                  <span className="text-orange-700">✓</span>
                </div>
                <span>+31 beneficiarios activos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100/80 p-2 rounded-full">
                  <span className="text-orange-700">✓</span>
                </div>
                <span>Talleres educativos especializados</span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-start gap-4 mt-8">
              <Link 
                to="/conocenos"
                className="bg-gradient-to-r text-white from-blue-400 to-blue-700 py-3 px-6 rounded-md text-sm hover:opacity-90 transition"
              >
               Conocenos Más
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AboutSection;