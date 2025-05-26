import quienesSomosImg from "../../assets/quienessomos.png";
import { Link } from '@tanstack/react-router';

const AboutSection = () => {
    return (
      <div className="flex flex-col items-center mt-20 tracking-wide lg:mt-32">
        <h2 className="text-orange-700 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide">
          Conoce Más Sobre
          <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
            {" "}
            Nuestra Historia
          </span>
        </h2>
        <div className="flex flex-col lg:flex-row items-center justify-center mt-10 gap-10">
          <div className="w-full lg:w-1/2 p-4">
            <img src={quienesSomosImg} alt="ASONIPED" className="rounded-xl shadow-2xl"/>
          </div>
          <div className="w-full lg:w-1/2 p-4 space-y-6">
            <p className="text-neutral-500 text-lg text-center lg:text-left">
              Trabajamos incansablemente para promover la inclusión de personas con discapacidad en la región de Nicoya.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 p-2 rounded-full">
                  <span className="text-orange-500">✓</span>
                </div>
                <span>+31 beneficiarios activos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 p-2 rounded-full">
                  <span className="text-orange-500">✓</span>
                </div>
                <span>Talleres educativos especializados</span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-start gap-4 mt-8">
              <Link 
                to="/conocenos"
                className="bg-gradient-to-r text-white from-orange-500 to-orange-800 py-3 px-6 rounded-md text-sm hover:opacity-80 transition"
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