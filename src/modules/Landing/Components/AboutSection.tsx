import quienesSomosImg from "../../../assets/quienessomos.png";


const AboutSection = () => {
  return (
    <div className="flex flex-col items-center mt-20 tracking-wide lg:mt-32">
      <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide">
        Conoce Más Sobre Nuestra Historia
      </h2>
      
      <div className="flex flex-col lg:flex-row items-center justify-center mt-10 gap-10">
        {/* Imagen */}
        <div className="w-full lg:w-1/2 p-4">
          <img 
            src={quienesSomosImg} 
            alt="ASONIPED" 
            className="rounded-xl shadow-2xl"
          />
        </div>

        {/* Contenido */}
        <div className="w-full lg:w-1/2 p-4 space-y-6">
          <p className="text-neutral-700 text-lg leading-relaxed text-center lg:text-left py-2 tracking-wide">
            Desde 1989, <span className="font-semibold text-orange-600">ASONIPED</span> ha trabajado para transformar la vida de personas con discapacidad en la región de Nicoya. 
            Lo que comenzó como un pequeño grupo de apoyo familiar, hoy es una asociación consolidada que impulsa programas 
            educativos, sociales y recreativos para promover la inclusión y el desarrollo integral.
          </p>

          {/* Botón */}
          <div className="flex justify-center lg:justify-start gap-4 mt-6">
            <a
              href="/conocenos"
              className="bg-gradient-to-r from-blue-400 to-blue-700 text-white py-3 px-6 rounded-md text-sm hover:opacity-90 transition"
            >
              Conócenos Más
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
