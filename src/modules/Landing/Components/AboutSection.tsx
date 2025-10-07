import { useEffect, useState } from "react";
import quienesSomosImg from "../../../assets/quienessomos.png";
import { aboutService, type AboutSection as AboutData } from "../../Dashboards/Services/aboutService";

const AboutSection = () => {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const items = await aboutService.getAll();
        if (items.length > 0) setAbout(items[0]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando sección");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const title = about?.titulo ?? "Nuestra Historia";
  const image = about?.URL_imagen ?? quienesSomosImg;
  const description =
    about?.descripcion ??
    "Desde 1989, ASONIPED ha trabajado para transformar la vida de personas con discapacidad en la región de Nicoya.";
  const buttonText = about?.texto_boton ?? "Conócenos Más";
  const buttonColor = about?.color_boton ?? "#3b82f6"; // azul predeterminado

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-neutral-500">Cargando...</span>
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col lg:flex-row items-center justify-between mt-20 lg:mt-32 overflow-hidden">
      {/* Contenido (texto) */}
      <div className="w-full lg:w-1/2 px-8 lg:px-20 space-y-6 text-center lg:text-left">
        <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide">
          {title}
        </h2>

        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <p className="text-neutral-700 text-lg leading-relaxed tracking-wide mt-4">
            {description}
          </p>
        )}

        <div className="mt-8 flex justify-center lg:justify-start">
          <a
            href="/conocenos"
            className="text-white py-3 px-6  rounded-full border text-sm hover:opacity-90 transition"
            style={{ borderColor: buttonColor, color: buttonColor }}
          >
            {buttonText}
          </a>
        </div>
      </div>

      {/* Imagen (lado derecho con forma curva) */}
      <div className="w-full lg:w-1/2 relative mt-10 lg:mt-0">
        <div className="w-full h-[350px] lg:h-[500px] overflow-hidden rounded-l-[200px]">
          <img
            src={image}
            alt="ASONIPED"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
