import { useState, useEffect } from "react";
import type { SectionData, SectionKey } from "../Types/types";
import { ModalSimple } from "./ModalSimple.tsx";
import { heroService } from "../Services/heroService";
import { aboutService } from "../Services/aboutService";
import { volunteerLandingService } from "../Services/volunteerLandingService";

export function PreviewModal({
  sectionData,
  onClose,
}: {
  sectionData: Record<SectionKey, SectionData>;
  onClose: () => void;
}) {
  const [heroData, setHeroData] = useState<any>(null);
  const [aboutData, setAboutData] = useState<any>(null);
  const [volunteerData, setVolunteerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setLoading(true);
        const [hero, about, volunteer] = await Promise.all([
          heroService.getAll().then(data => data[0] || null).catch(() => null),
          aboutService.getAll().then(data => data[0] || null).catch(() => null),
          volunteerLandingService.getAll().then(data => data[0] || null).catch(() => null),
        ]);
        
        setHeroData(hero);
        setAboutData(about);
        setVolunteerData(volunteer);
      } catch (error) {
        console.error('Error loading preview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreviewData();
  }, []);

  const hero = heroData || sectionData.hero || {};
  const about = aboutData || sectionData.about || {};
  const volunteering = volunteerData || sectionData.volunteering || {};
  const location = sectionData.location || {};
  const testimonials = sectionData.testimonials || {};
  const footer = sectionData.footer || {};

  if (loading) {
    return (
      <ModalSimple onClose={onClose}>
        <div className="p-6 max-w-6xl w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando vista previa...</p>
            </div>
          </div>
        </div>
      </ModalSimple>
    );
  }

  return (
    <ModalSimple onClose={onClose}>
      <div className="p-6 max-w-7xl w-full overflow-auto max-h-[95vh] bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Vista Previa</h2>
                <p className="text-sm text-gray-600">Contenido dinámico del sitio web</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Última actualización</div>
              <div className="text-sm font-semibold text-gray-800">
                {new Date().toLocaleDateString('es-ES', { 
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* HERO */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sección Principal</h3>
            <div className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ID: {hero.id || 'N/A'}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {hero.titulo ? (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{hero.titulo}</h4>
                    {hero.descripcion && (
                      <p className="text-gray-600 leading-relaxed">{hero.descripcion}</p>
                    )}
                  </div>
                  
                  {hero.url_imagen && (
                    <div className="relative rounded-lg overflow-hidden shadow-md">
                      <img
                        src={hero.url_imagen}
                        alt="Imagen principal"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {hero.texto_boton_izquierdo && (
                      <button
                        className="px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        style={{ backgroundColor: hero.color_boton_izquierdo || "#3b82f6" }}
                      >
                        {hero.texto_boton_izquierdo}
                      </button>
                    )}
                    {hero.texto_boton_derecho && (
                      <button
                        className="px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        style={{ backgroundColor: hero.color_boton_derecho || "#3b82f6" }}
                      >
                        {hero.texto_boton_derecho}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Sección sin configurar</p>
                <p className="text-sm text-gray-400 mt-1">No hay contenido disponible para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* ABOUT */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sobre Nosotros</h3>
            <div className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ID: {about.id || 'N/A'}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {about.titulo ? (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{about.titulo}</h4>
                    {about.descripcion && (
                      <p className="text-gray-600 leading-relaxed">{about.descripcion}</p>
                    )}
                  </div>
                  
                  {about.URL_imagen && (
                    <div className="relative rounded-lg overflow-hidden shadow-md">
                      <img
                        src={about.URL_imagen}
                        alt="Imagen sobre nosotros"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}

                  {about.texto_boton && (
                    <div className="pt-2">
                      <button
                        className="px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        style={{ backgroundColor: about.color_boton || "#10b981" }}
                      >
                        {about.texto_boton}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Sección sin configurar</p>
                <p className="text-sm text-gray-400 mt-1">No hay contenido disponible para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* VOLUNTEERING */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Voluntariado</h3>
            <div className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ID: {volunteering.id || 'N/A'}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {volunteering.titulo ? (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{volunteering.titulo}</h4>
                    {volunteering.subtitulo && (
                      <p className="text-lg text-gray-600 font-medium mb-3">{volunteering.subtitulo}</p>
                    )}
                    {volunteering.descripcion && (
                      <p className="text-gray-600 leading-relaxed">{volunteering.descripcion}</p>
                    )}
                  </div>
                  
                  {volunteering.URL_imagen && (
                    <div className="relative rounded-lg overflow-hidden shadow-md">
                      <img
                        src={volunteering.URL_imagen}
                        alt="Imagen de voluntariado"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}

                  {volunteering.texto_boton && (
                    <div className="pt-2">
                      <button
                        className="px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        style={{ backgroundColor: volunteering.color_boton || "#f97316" }}
                      >
                        {volunteering.texto_boton}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Sección sin configurar</p>
                <p className="text-sm text-gray-400 mt-1">No hay contenido disponible para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* LOCATION */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">4</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Ubicación</h3>
            <div className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Próximamente
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Sección en desarrollo</p>
              <p className="text-sm text-gray-400 mt-1">Próximamente disponible</p>
            </div>
          </div>
        </div>

        {/* TESTIMONIOS */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">5</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Testimonios</h3>
            <div className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Próximamente
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Sección en desarrollo</p>
              <p className="text-sm text-gray-400 mt-1">Próximamente disponible</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">6</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Pie de Página</h3>
            <div className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Próximamente
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Sección en desarrollo</p>
              <p className="text-sm text-gray-400 mt-1">Próximamente disponible</p>
            </div>
          </div>
        </div>
      </div>
    </ModalSimple>
  );
}
