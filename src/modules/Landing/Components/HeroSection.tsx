import React, { useState, useEffect } from 'react';
import heroImage from '../../../assets/fondoasoniped.jpg';
import { heroService, type HeroSection } from '../../Dashboards/Services/heroService';

const HeroSection = () => {
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHeroData();
  }, []);

  const loadHeroData = async () => {
    try {
      setLoading(true);
      const heroSections = await heroService.getAll();
      if (heroSections.length > 0) {
        setHeroData(heroSections[0]); // Use the first hero section
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading hero data');
    } finally {
      setLoading(false);
    }
  };

  // Fallback data if backend fails or no data
  const fallbackData = {
    titulo: "Inclusión Sin Límites, Oportunidades Para Todos",
    descripcion: "En ASONIPED trabajamos para derribar barreras y construir un futuro accesible en Nicoya. Únete a nuestra comunidad",
    url_imagen: heroImage,
    texto_boton_izquierdo: "Apoyar la Causa",
    color_boton_izquierdo: "#ffffff",
    texto_boton_derecho: "Conocer Más",
    color_boton_derecho: "#ffffff"
  };

  const data = heroData || fallbackData;

  if (loading) {
    return (
      <section className="relative bg-cover bg-center w-full min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </section>
    );
  }

  return (
    <section
      className="relative bg-cover bg-center w-full min-h-screen flex items-center justify-center"
             style={{
               backgroundImage: `url(${data.url_imagen || heroImage})`
             }}
      aria-label="Sección principal de ASONIPED"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Contenido */}
      <div className="relative z-10 text-center px-4 max-w-5xl text-white">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide">
          {data.titulo}
        </h1>

        <p className="text-lg py-6 max-w-3xl mx-auto">
          {data.descripcion}
        </p>

        <div className="flex justify-center my-10 flex-wrap gap-4">
          <a
            href="/donaciones/formulario"
            className="bg-transparent text-white font-semibold py-3 px-10 rounded-full border border-white hover:bg-white/20 transition"
            style={{ 
              borderColor: data.color_boton_izquierdo,
              color: data.color_boton_izquierdo 
            }}
          >
            {data.texto_boton_izquierdo}
          </a>
          <a
            href="Conocenos"
            className="bg-transparent text-white font-semibold py-3 px-8 rounded-full border border-white hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white"
            style={{ 
              borderColor: data.color_boton_derecho,
              color: data.color_boton_derecho 
            }}
          >
            {data.texto_boton_derecho}
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
