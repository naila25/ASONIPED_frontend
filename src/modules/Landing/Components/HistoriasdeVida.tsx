
type Historia = {
  nombre: string;
  historia: string;
  esVideo?: boolean;
  videoUrl?: string; 
};


const historias: Historia[] = [
  {
    nombre: "María Vargas",
    historia:
      "María comparte su experiencia de vida, marcada por retos que transformó en aprendizajes. Gracias al acompañamiento de ASONIDEP, encontró nuevas oportunidades para crecer y sentirse valorada.",
    esVideo: true,
    videoUrl: "https://www.youtube.com/embed/ndMKprbFulc",
  },
  {
    nombre: "Freyzon Patterson",
    historia:
      "Freyzon nos cuenta cómo, a través de la perseverancia y el apoyo recibido, logró superar dificultades y hoy inspira a otros con su historia de resiliencia dentro de ASONIDEP.",
    esVideo: true,
    videoUrl: "https://www.youtube.com/embed/Q2ddfSFGBaQ",
  },
  {
    nombre: "Ana García",
    historia:
      "Ana relata cómo el acompañamiento y la inclusión que encontró en ASONIDEP cambiaron su perspectiva de vida, dándole la fuerza para soñar y alcanzar nuevas metas.",
    esVideo: true,
    videoUrl: "https://www.youtube.com/embed/aTteFansSCc",
  },
];

// Componente principal
const HistoriasdeVida = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 text-center mt-20">
      {/* Título principal */}
      <h2 className= "text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide mt-20 mb-5">
        Testimonios de Vida
      </h2>

      {/* Subtítulo */}
      <p className="text-neutral-700 mb-12 max-w-3xl mx-auto">
        “Descubre cómo la voz de quienes forman parte de ASONIDEP refleja esperanza, inclusión y superación, a través de experiencias que inspiran y motivan a toda nuestra comunidad.”
      </p>

      {/* Grid de historias */}
      <div className="grid md:grid-cols-3 gap-10">
  {historias.map((historia, index) => (
    <div key={index}>
      {/* Video con borde simple */}
      <div className="w-full h-52 border border-gray-300 rounded-md overflow-hidden mb-3">
        {historia.esVideo && historia.videoUrl ? (
          <iframe
            src={historia.videoUrl}
            title={historia.nombre}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : null}
      </div>

      {/* Nombre centrado */}
      <h3 className="font-bold text-lg text-center text-gray-800 mb-2">
        {historia.nombre}
      </h3>

      {/* Texto justificado */}
      <p className="text-gray-700 text-sm text-justify">
        {historia.historia}
      </p>
    </div>
  ))}
</div>


    </section>
  );
};

export default HistoriasdeVida;
