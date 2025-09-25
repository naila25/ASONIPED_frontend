import React, { useState, useEffect } from "react";

import type { SectionData, SectionKey, ValueItem } from "../Types/types";
import { ModalSimple } from "./ModalSimple.tsx";
import { heroService, type HeroSection } from "../Services/heroService.ts";
import { aboutService, type AboutSection as AboutPayload } from "../Services/aboutService";
import { volunteerLandingService, type LandingVolunteer } from "../Services/volunteerLandingService";

// Extiendo ValueItem para incluir id, que es necesario para edición y eliminación
type ValueItemWithId = ValueItem & { id: string };

export function LandingSectionEditor({
  section,
  initialData,
  onSave,
  onCancel,
  onUpdate,
}: {
  section: SectionKey;
  initialData: SectionData;
  onSave: (data: SectionData) => void;
  onCancel: () => void;
  onUpdate: (partial: Partial<SectionData>) => void;
}) {
  // Inicializo valores con id, si no vienen (para evitar errores)
  const addIdToValues = (values?: ValueItem[]): ValueItemWithId[] => {
    if (!values) return [];
    return values.map((v, i) => {
      if ('id' in v) return v as ValueItemWithId;
      return { ...v, id: String(Date.now()) + "_" + i };
    });
  };

  // Estado local con valores con id en values
  const [data, setData] = useState<SectionData>({
    ...initialData,
    values: addIdToValues(initialData.values),
  });

  // Estado específico para hero section del backend
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateHero = (data: HeroSection): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.titulo || data.titulo.length  || data.titulo.length ) {
      errors.titulo = "Título es requerido";
    }
    if (data.url_imagen && (data.url_imagen.length || !isValidUrl(data.url_imagen))) {
      errors.url_imagen = "URL de imagen debe ser válida";
    }
    if (!data.descripcion || data.descripcion.length  ) {
      errors.descripcion = "Descripción es requerida";
    }
    if (!data.texto_boton_izquierdo || data.texto_boton_izquierdo.length  || data.texto_boton_izquierdo.length ) {
      errors.texto_boton_izquierdo = "Texto botón izquierdo es requerido";
    }
    if (!data.color_boton_izquierdo || data.color_boton_izquierdo.length ) {
      errors.color_boton_izquierdo = "Color botón izquierdo es requerido";
    }
    if (!data.texto_boton_derecho || data.texto_boton_derecho.length  || data.texto_boton_derecho.length ) {
      errors.texto_boton_derecho = "Texto botón derecho es requerido";
    }
    if (!data.color_boton_derecho || data.color_boton_derecho.length ) {
      errors.color_boton_derecho = "Color botón derecho es requerido";
    }
    
    return errors;
  };

  const validateAbout = (data: Record<string, unknown>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.titulo || typeof data.titulo !== "string" || data.titulo.length  || data.titulo.length ) {
      errors.titulo = "Título es requerido";
    }
    if (!data.URL_imagen || typeof data.URL_imagen !== "string" || data.URL_imagen.length  || !isValidUrl(data.URL_imagen as string)) {
      errors.URL_imagen = "URL de imagen es requerida";
    }
    if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.length ) {
      errors.descripcion = "Descripción es requerida";
    }
    if (!data.texto_boton || typeof data.texto_boton !== "string" || data.texto_boton.length  || data.texto_boton.length > 100) {
      errors.texto_boton = "Texto botón es requerido";
    }
    if (!data.color_boton || typeof data.color_boton !== "string" || data.color_boton.length ) {
      errors.color_boton = "Color botón es requerido";
    }
    
    return errors;
  };

  const validateVolunteer = (data: Record<string, unknown>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.titulo || typeof data.titulo !== "string" || data.titulo.length  || data.titulo.length ) {
      errors.titulo = "Título es requerido";
    }
    if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.length ) {
      errors.descripcion = "Descripción es requerida";
    }
    if (!data.URL_imagen || typeof data.URL_imagen !== "string" || data.URL_imagen.length  || !isValidUrl(data.URL_imagen as string)) {
      errors.URL_imagen = "URL de imagen es requerida, válida";
    }
    if (!data.subtitulo || typeof data.subtitulo !== "string" || data.subtitulo.length || data.subtitulo.length > 255) {
      errors.subtitulo = "Subtítulo es requerido";
    }
    if (!data.texto_boton || typeof data.texto_boton !== "string" || data.texto_boton.length || data.texto_boton.length > 100) {
      errors.texto_boton = "Texto botón es requerido";
    }
    if (!data.color_boton || typeof data.color_boton !== "string" || data.color_boton.length ) {
      errors.color_boton = "Color botón es requerido";
    }
    
    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Avoid overriding locally edited dynamic sections
    if (section === 'hero' || section === 'about' || section === 'volunteering') return;
    setData({
      ...initialData,
      values: addIdToValues(initialData.values),
    });
  }, [initialData, section]);

  // Cargar datos del hero/about/volunteers desde el backend
  useEffect(() => {
    if (section === "hero") {
      loadHeroData();
    }
    if (section === "about") {
      (async () => {
        try {
          setLoading(true);
          const list = await aboutService.getAll();
          const first = list[0];
          if (first) {
            setData(prev => ({ ...prev, 
              // map backend fields into local data for the form binding
              ...(first as Record<string, unknown>)
            }));
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error loading about data');
        } finally {
          setLoading(false);
        }
      })();
    }
    if (section === "volunteering") {
      (async () => {
        try {
          setLoading(true);
          const list = await volunteerLandingService.getAll();
          const first = list[0];
          if (first) {
            setData(prev => ({ ...prev, 
              // map backend fields into local data for the form binding
              ...(first as Record<string, unknown>)
            }));
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error loading volunteer data');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [section]);

  const loadHeroData = async () => {
    try {
      setLoading(true);
      const heroSections = await heroService.getAll();
      if (heroSections.length > 0) {
        setHeroData(heroSections[0]); // Usar el primer hero section
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading hero data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SectionData, value: unknown) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate({ [field]: value });
  };

  const handleNestedChange = (parentField: keyof SectionData, field: string, value: unknown) => {
    const parentData = (data[parentField] as unknown as Record<string, unknown>) || {};
    const newData = {
      ...data,
      [parentField]: { ...parentData, [field]: value }
    };
    setData(newData);
    onUpdate({ [parentField]: newData[parentField] });
  };

  // Handlers específicos para hero section
  const handleHeroChange = (field: keyof HeroSection, value: string) => {
    setHeroData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroData) return;

    // Validate hero data
    const errors = validateHero(heroData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    try {
      setLoading(true);
      if (heroData.id) {
        // Update existing hero section
        await heroService.update(heroData.id, heroData);
      } else {
        // Create new hero section
        const result = await heroService.create(heroData);
        setHeroData(prev => prev ? { ...prev, id: result.id } : null);
      }
      onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving hero section');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (section === "hero") {
      handleHeroSubmit(e);
    } else {
    onSave(data);
    }
  };

  return (
    <ModalSimple onClose={onCancel}>
      <div className="p-6 space-y-6 max-w-6xl w-full overflow-auto">
        <form onSubmit={handleSubmit}>
          {/* Campos específicos para cada sección */}

          {/* Hero Section */}
          {section === "hero" && (
            <div className="mt-4 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Personalizar {section}</h2>
              
              {loading && <div className="text-blue-600">Cargando datos...</div>}
              {error && <div className="text-red-600">Error: {error}</div>}
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="text-red-800 font-medium mb-2">Errores de validación:</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    {Object.entries(validationErrors).map(([field, message]) => (
                      <li key={field}>• {message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título: 
                  </label>
                  <input
                    value={heroData?.titulo || ""}
                    onChange={(e) => handleHeroChange("titulo", e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(heroData?.titulo || "").length}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción: 
                  </label>
                  <textarea
                    value={heroData?.descripcion || ""}
                    onChange={(e) => handleHeroChange("descripcion", e.target.value)}
                    maxLength={250}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(heroData?.descripcion || "").length}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Subir imagen:</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('image', file);
                      try {
                        const res = await fetch('http://localhost:3000/api/upload/image', {
                          method: 'POST',
                          body: form,
                        });
                        if (!res.ok) throw new Error('Upload failed');
                        const { url } = await res.json();
                        handleHeroChange("url_imagen", url);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                {heroData?.url_imagen && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img src={heroData.url_imagen} alt="Hero preview" className="max-h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Botón Izquierdo: 
                  </label>
              <input
                    value={heroData?.texto_boton_izquierdo || ""}
                    onChange={(e) => handleHeroChange("texto_boton_izquierdo", e.target.value)}
                    maxLength={50}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                {(heroData?.texto_boton_izquierdo || "").length}
              </div>
            </div>

            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Botón Izquierdo:</label>
              <input
                type="color"
                    value={heroData?.color_boton_izquierdo || "#1976d2"}
                    onChange={(e) => handleHeroChange("color_boton_izquierdo", e.target.value)}
                    className="w-20 h-10 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Botón Derecho: 
                  </label>
                  <input
                    value={heroData?.texto_boton_derecho || ""}
                    onChange={(e) => handleHeroChange("texto_boton_derecho", e.target.value)}
                    maxLength={50}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                {(heroData?.texto_boton_derecho || "").length}
              </div>
            </div>

            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Botón Derecho:</label>
              <input
                type="color"
                    value={heroData?.color_boton_derecho || "#1976d2"}
                    onChange={(e) => handleHeroChange("color_boton_derecho", e.target.value)}
                    className="w-20 h-10 rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          )}


          {/* About Section */}
          {section === "about" && (
            <div className="mt-4 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Personalizar about</h2>
              
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="text-red-800 font-medium mb-2">Errores de validación:</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    {Object.entries(validationErrors).map(([field, message]) => (
                      <li key={field}>• {message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título: 
                  </label>
                  <input
                    value={(data as Record<string, unknown>).titulo as string || ""}
                    onChange={(e) => handleChange("titulo" as unknown as keyof SectionData, e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).titulo as string || "").length}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto botón: 
                  </label>
                  <input
                    value={(data as Record<string, unknown>).texto_boton || ""}
                    onChange={(e) => handleChange("texto_boton" as unknown as keyof SectionData, e.target.value)}
                    maxLength={50}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).texto_boton as string || "").length}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Subir imagen:</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('image', file);
                      try {
                        const res = await fetch('http://localhost:3000/api/upload/image', {
                          method: 'POST',
                          body: form,
                        });
                        if (!res.ok) throw new Error('Upload failed');
                        const { url } = await res.json();
                        handleChange("URL_imagen" as unknown as keyof SectionData, url);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
                {(data as Record<string, unknown>).URL_imagen && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img src={(data as Record<string, unknown>).URL_imagen} alt="About preview" className="max-h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción: 
                </label>
                <textarea
                  value={(data as Record<string, unknown>).descripcion || ""}
                  onChange={(e) => handleChange("descripcion" as unknown as keyof SectionData, e.target.value)}
                  maxLength={250}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((data as Record<string, unknown>).descripcion as string || "").length}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-gray-700">Color botón:</label>
                <input
                  type="color"
                  value={(data as Record<string, unknown>).color_boton || "#1976d2"}
                  onChange={(e) => handleChange("color_boton" as unknown as keyof SectionData, e.target.value)}
                  className="w-20 h-10 rounded-lg border border-gray-300"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const payload = {
                      titulo: (data as Record<string, unknown>).titulo || "",
                      URL_imagen: (data as Record<string, unknown>).URL_imagen || "",
                      descripcion: (data as Record<string, unknown>).descripcion || "",
                      texto_boton: (data as Record<string, unknown>).texto_boton || "",
                      color_boton: (data as Record<string, unknown>).color_boton || "#1976d2",
                    };
                    
                    // Validate about data
                    const errors = validateAbout(payload);
                    if (Object.keys(errors).length > 0) {
                      setValidationErrors(errors);
                      return;
                    }
                    
                    setValidationErrors({});
                    try {
                      // Try to get one existing item
                      const existing = await aboutService.getAll().then(list => list[0]).catch(() => undefined);
                      if (existing && existing.id) {
                        await aboutService.update(existing.id, payload);
                      } else {
                        await aboutService.create(payload);
                      }
                      onSave(data);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {section === "volunteering" && (
            <div className="mt-4 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Personalizar voluntariado</h2>
              
              {loading && <div className="text-blue-600">Cargando datos...</div>}
              {error && <div className="text-red-600">Error: {error}</div>}
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="text-red-800 font-medium mb-2">Errores de validación:</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    {Object.entries(validationErrors).map(([field, message]) => (
                      <li key={field}>• {message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título: 
                  </label>
                  <input
                    value={(data as Record<string, unknown>).titulo as string || ""}
                    onChange={(e) => handleChange("titulo" as unknown as keyof SectionData, e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).titulo as string || "").length}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo: 
                  </label>
                  <input
                    value={(data as Record<string, unknown>).subtitulo || ""}
                    onChange={(e) => handleChange("subtitulo" as unknown as keyof SectionData, e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).subtitulo as string || "").length}
                  </div>
                </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción: 
                </label>
              <textarea
                  value={(data as Record<string, unknown>).descripcion || ""}
                  onChange={(e) => handleChange("descripcion" as unknown as keyof SectionData, e.target.value)}
                  maxLength={250}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((data as Record<string, unknown>).descripcion as string || "").length}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Subir imagen:</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('image', file);
                      try {
                        const res = await fetch('http://localhost:3000/api/upload/image', {
                          method: 'POST',
                          body: form,
                        });
                        if (!res.ok) throw new Error('Upload failed');
                        const { url } = await res.json();
                        handleChange("URL_imagen" as unknown as keyof SectionData, url);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                {(data as Record<string, unknown>).URL_imagen && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img src={(data as Record<string, unknown>).URL_imagen} alt="Volunteer preview" className="max-h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto botón: 
                  </label>
                  <input
                    value={(data as Record<string, unknown>).texto_boton || ""}
                    onChange={(e) => handleChange("texto_boton" as unknown as keyof SectionData, e.target.value)}
                    maxLength={50}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                      {((data as Record<string, unknown>).texto_boton as string || "").length}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color botón:</label>
                  <input
                    type="color"
                    value={(data as Record<string, unknown>).color_boton || "#1976d2"}
                    onChange={(e) => handleChange("color_boton" as unknown as keyof SectionData, e.target.value)}
                    className="w-20 h-10 rounded-lg border border-gray-300"
              />
            </div>
          </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const payload = {
                      titulo: (data as Record<string, unknown>).titulo || "",
                      subtitulo: (data as Record<string, unknown>).subtitulo || "",
                      descripcion: (data as Record<string, unknown>).descripcion || "",
                      URL_imagen: (data as Record<string, unknown>).URL_imagen || "",
                      texto_boton: (data as Record<string, unknown>).texto_boton || "",
                      color_boton: (data as Record<string, unknown>).color_boton || "#1976d2",
                    };
                    
                    // Validate volunteer data
                    const errors = validateVolunteer(payload);
                    if (Object.keys(errors).length > 0) {
                      setValidationErrors(errors);
                      return;
                    }
                    
                    setValidationErrors({});
                    try {
                      const existing = await volunteerLandingService.getAll().then(list => list[0]).catch(() => undefined);
                      if (existing && existing.id) {
                        await volunteerLandingService.update(existing.id, payload);
                      } else {
                        await volunteerLandingService.create(payload);
                      }
                      onSave(data);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {section === "location" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título de Ubicación</label>
                <input
                  type="text"
                  value={data.locationTitle || ""}
                  onChange={(e) => handleChange("locationTitle", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Link de Ubicación</label>
                <input
                  type="text"
                  value={data.locationLink || ""}
                  onChange={(e) => handleChange("locationLink", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          )}

          {section === "testimonials" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título de Testimonios</label>
                <input
                  type="text"
                  value={data.testimonialsTitle || ""}
                  onChange={(e) => handleChange("testimonialsTitle", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción de Testimonios</label>
                <textarea
                  value={data.testimonialsDescription || ""}
                  onChange={(e) => handleChange("testimonialsDescription", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          )}

          {section === "footer" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={data.footer?.companyName || ""}
                  onChange={(e) => handleNestedChange("footer", "companyName", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  value={data.footer?.phone || ""}
                  onChange={(e) => handleNestedChange("footer", "phone", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={data.footer?.email || ""}
                  onChange={(e) => handleNestedChange("footer", "email", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </ModalSimple>
  );
}