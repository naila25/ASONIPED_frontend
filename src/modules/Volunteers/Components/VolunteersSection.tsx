import { useEffect, useState } from "react";
import asoPrin from "../../../assets/profile-pictures/asoPrin.jpg" 
import { volunteerLandingService, type LandingVolunteer } from "../../Dashboards/Services/volunteerLandingService";

const VoluntariadoSection = () => {
  const [data, setData] = useState<LandingVolunteer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await volunteerLandingService.getAll();
        setData(list[0] || null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error loading volunteers');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const backgroundImage = data?.URL_imagen || asoPrin;
  const titulo = data?.titulo || "Sé parte del voluntariado de ASONIPED";
  const subtitulo = data?.subtitulo || "¿Quieres conocer más sobre los voluntariados disponibles, perfil del voluntariado y cómo unirte?";
  const descripcion = data?.descripcion || "En ASONIPED creemos en el valor de la solidaridad y la entrega hacia quienes más lo necesitan. Tu participación como voluntario nos ayuda a seguir construyendo un futuro digno y lleno de esperanza.";
  const textoBoton = data?.texto_boton || "Ver más información";

  return (
    <section
      className="relative bg-cover bg-center w-full min-h-[90vh] flex items-center justify-center mx-0 px-0 mt-40"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      aria-label="Sección de voluntariado de ASONIPED"
    >
      {/* Overlay para oscurecer la imagen de fondo */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black/60"></div>

      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl ">
        <h2 className="text-4xl font-bold tracking-wide mb-4">
          {titulo}
        </h2>

        {/* Separador con ícono */}
        <div className="flex justify-center items-center mb-6">
          <span className="border-t border-gray-300 w-30 mx-4"></span>
          <span className="text-2xl">🤝</span>
          <span className="border-t border-gray-300 w-30 mx-4"></span>
        </div>

        <p className="text-lg mb-6">
          {descripcion}
        </p>

        <p className="text-xl font-semibold mb-6">
          {subtitulo}
        </p>

        {/* Botón */}
        <a
          href="/VolunteerCard" 
          aria-label="Ir a la página con más información sobre voluntariado en ASONIPED"
        >
          <button 
            className="bg-transparent text-white font-semibold py-3 px-8 rounded-full border border-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          >
            {textoBoton}
          </button>
        </a>
      </div>
    </section>
  );
};

export default VoluntariadoSection;
