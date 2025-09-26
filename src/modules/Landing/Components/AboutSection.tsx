import React, { useEffect, useState } from "react";
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

  const title = about?.titulo ?? "Conoce Más Sobre Nuestra Historia";
  const image = about?.URL_imagen ?? quienesSomosImg;
  const description = about?.descripcion ??
    "Desde 1989, ASONIPED ha trabajado para transformar la vida de personas con discapacidad en la región de Nicoya.";
  const buttonText = about?.texto_boton ?? "Conócenos Más";
  const buttonColor = about?.color_boton ?? "#3b82f6"; // blue-500

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-neutral-500">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-20 tracking-wide lg:mt-32">
      <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide">
        {title}
      </h2>
      
      <div className="flex flex-col lg:flex-row items-center justify-center mt-10 gap-10">
        {/* Imagen */}
        <div className="w-full lg:w-1/2 p-4">
          <img 
            src={image} 
            alt="ASONIPED" 
            className="rounded-xl shadow-2xl"
          />
        </div>

        {/* Contenido */}
        <div className="w-full lg:w-1/2 p-4 space-y-6">
          {error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : (
            <p className="text-neutral-700 text-lg leading-relaxed text-center lg:text-left py-2 tracking-wide">
              {description}
            </p>
          )}

          {/* Botón */}
          <div className="flex justify-center lg:justify-start gap-4 mt-6">
            <a
              href="/conocenos"
              className="text-white py-3 px-6  rounded-full border text-sm hover:opacity-90 transition"
              style={{ backgroundColor: buttonColor }}
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
