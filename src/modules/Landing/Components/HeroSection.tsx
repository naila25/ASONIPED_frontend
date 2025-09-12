import heroImage from '../../../assets/fondoasoniped.jpg'; 

const HeroSection = () => {
  return (
    <section
      className="relative bg-cover bg-center w-full min-h-screen flex items-center justify-center"
      style={{ backgroundImage: `url(${heroImage})` }}
      aria-label="Sección principal de ASONIPED"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Contenido */}
      <div className="relative z-10 text-center px-4 max-w-5xl text-white">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide">
          Inclusión Sin Límites, Oportunidades Para Todos
        </h1>

        <p className="text-lg py-6 max-w-3xl mx-auto">
          En ASONIPED trabajamos para derribar barreras y construir un futuro accesible en Nicoya. 
          Únete a nuestra comunidad
        </p>

        <div className="flex justify-center my-10 flex-wrap gap-4">
          <a
            href="/donaciones/formulario"
            className="bg-transparent text-white font-semibold py-3 px-10 rounded-full border border-white hover:bg-white/20 transition"
          >
            Apoyar la Causa
          </a>
          <a
            href="Conocenos"
            className="bg-transparent text-white font-semibold py-3 px-8 rounded-full border border-white hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white"
          >
            Conocer Más
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
