import React, { useState, useEffect } from "react";

import type { SectionData, SectionKey, ValueItem } from "../Types/types";
import { ModalSimple } from "./ModalSimple.tsx";
import { heroService, type HeroSection } from "../Services/heroService.ts";
import { aboutService, type AboutSection } from "../Services/aboutService";
import { volunteerLandingService, type LandingVolunteer } from "../Services/volunteerLandingService";
import { donationService, type DonationSection, type DonationsCard } from "../Services/donationService";

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
  // Estado específico para donation section del backend
  const [donationData, setDonationData] = useState<DonationSection | null>(null);
  const [cardForm, setCardForm] = useState<DonationsCard>({
    titulo_card: "",
    descripcion_card: "",
    URL_imagen: "",
    texto_boton: "",
    color_boton: "#1976d2"
  });
  const [cardFile, setCardFile] = useState<File | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateHero = (data: HeroSection): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.titulo || data.titulo.length < 3 || data.titulo.length > 255) {
      errors.titulo = "Título es requerido y debe tener entre 3 y 255 caracteres";
    }
    if (data.url_imagen && data.url_imagen.length > 0 && !isValidUrl(data.url_imagen)) {
      errors.url_imagen = "URL de imagen debe ser válida";
    }
    if (!data.descripcion || data.descripcion.length < 3) {
      errors.descripcion = "Descripción es requerida y debe tener al menos 3 caracteres";
    }
    if (!data.texto_boton_izquierdo || data.texto_boton_izquierdo.length < 1 || data.texto_boton_izquierdo.length > 50) {
      errors.texto_boton_izquierdo = "Texto botón izquierdo es requerido y debe tener entre 1 y 50 caracteres";
    }
    if (!data.color_boton_izquierdo || data.color_boton_izquierdo.length < 1) {
      errors.color_boton_izquierdo = "Color botón izquierdo es requerido";
    }
    if (!data.texto_boton_derecho || data.texto_boton_derecho.length < 1 || data.texto_boton_derecho.length > 50) {
      errors.texto_boton_derecho = "Texto botón derecho es requerido y debe tener entre 1 y 50 caracteres";
    }
    if (!data.color_boton_derecho || data.color_boton_derecho.length < 1) {
      errors.color_boton_derecho = "Color botón derecho es requerido";
    }
    return errors;
  };

  const validateAbout = (data: Record<string, unknown>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.titulo || typeof data.titulo !== "string" || data.titulo.length < 3 || data.titulo.length > 255) {
      errors.titulo = "Título es requerido y debe tener entre 3 y 255 caracteres";

    }
    if (!data.URL_imagen || typeof data.URL_imagen !== "string" || data.URL_imagen.length < 1 || !isValidUrl(data.URL_imagen as string)) {
      errors.URL_imagen = "URL de imagen es requerida y debe ser válida";
    }
    if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.length < 3) {
      errors.descripcion = "Descripción es requerida y debe tener al menos 3 caracteres";
    }
    if (!data.texto_boton || typeof data.texto_boton !== "string" || data.texto_boton.length < 1 || data.texto_boton.length > 100) {
      errors.texto_boton = "Texto botón es requerido y debe tener entre 1 y 100 caracteres";
    }
    if (!data.color_boton || typeof data.color_boton !== "string" || data.color_boton.length < 1) {
      errors.color_boton = "Color botón es requerido";
    }
    return errors;
  };

  const validateVolunteer = (data: Record<string, unknown>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.titulo || typeof data.titulo !== "string" || data.titulo.length < 3 || data.titulo.length > 255) {
      errors.titulo = "Título es requerido y debe tener entre 3 y 255 caracteres";

    }
    if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.length < 3) {
      errors.descripcion = "Descripción es requerida y debe tener al menos 3 caracteres";
    }
    if (!data.URL_imagen || typeof data.URL_imagen !== "string" || data.URL_imagen.length < 1 || !isValidUrl(data.URL_imagen as string)) {
      errors.URL_imagen = "URL de imagen es requerida y debe ser válida";
    }
    if (!data.subtitulo || typeof data.subtitulo !== "string" || data.subtitulo.length < 1 || data.subtitulo.length > 255) {
      errors.subtitulo = "Subtítulo es requerido y debe tener entre 1 y 255 caracteres";
    }
    if (!data.texto_boton || typeof data.texto_boton !== "string" || data.texto_boton.length < 1 || data.texto_boton.length > 100) {
      errors.texto_boton = "Texto botón es requerido y debe tener entre 1 y 100 caracteres";
    }
    if (!data.color_boton || typeof data.color_boton !== "string" || data.color_boton.length < 1) {
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

  const validateCard = (card: DonationsCard) => {
    const errors: Record<string, string> = {};
    if (!card.titulo_card || card.titulo_card.length < 3 || card.titulo_card.length > 100) {
      errors.titulo_card = "Título requerido y debe tener entre 3 y 100 caracteres";
    }
    if (!card.descripcion_card || card.descripcion_card.length > 250) {
      errors.descripcion_card = "Descripción requerida y máximo 250 caracteres";
    }
    if (!card.texto_boton || card.texto_boton.length < 1 || card.texto_boton.length > 100) {
      errors.texto_boton = "Texto botón requerido y debe tener entre 1 y 100 caracteres";
    }
    if (!card.color_boton || card.color_boton.length > 20) {
      errors.color_boton = "Color botón requerido y máximo 20 caracteres";
    }
    return errors;
  };

  useEffect(() => {
    // Avoid overriding locally edited dynamic sections
    if (section === 'hero' || section === 'about' || section === 'volunteering') return;
    setData({
      ...initialData,
      values: addIdToValues(initialData.values),
    });
  }, [initialData, section]);

  // Cargar datos del hero/about/volunteers/donation desde el backend
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
              ...(first as unknown as Record<string, unknown>)
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
              ...(first as unknown as Record<string, unknown>)
            }));

          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error loading volunteer data');
        } finally {
          setLoading(false);
        }
      })();
    }
    if (section === "donation") {
      loadDonationData();
    }
  }, [section]);

  const loadHeroData = async () => {
    try {
      setLoading(true);
      const heroSections = await heroService.getAll();
      if (heroSections.length > 0) {
        setHeroData(heroSections[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading hero data');
    } finally {
      setLoading(false);
    }
  };

  const loadDonationData = async () => {
    try {
      setLoading(true);
      const donationSection = await donationService.getSection();
      setDonationData(donationSection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading donation data');
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

  // Handlers específicos para donation section
  const handleDonationHeaderChange = (field: string, value: string) => {
    setDonationData(prev => prev ? { 
      ...prev, 
      header: { ...prev.header, [field]: value }
    } : null);
  };


  // Card form handlers
  const handleCardFormChange = (field: keyof DonationsCard, value: string) => {
    setCardForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCardFile(file);
    if (file) {
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setCardForm(prev => ({ ...prev, URL_imagen: previewUrl }));
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);
    const errors = validateCard(cardForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setLoading(true);
    try {
      let updatedCards;
      if (editingId) {
        const res = await donationService.updateCard(editingId, cardForm, cardFile);
        updatedCards = donationData?.cards.map(c => 
          c.id === editingId 
            ? { ...cardForm, id: editingId, URL_imagen: res.URL_imagen || cardForm.URL_imagen } 
            : c
        ) || [];
        setEditingId(null);
      } else {
        const res = await donationService.createCard(cardForm, cardFile);
        updatedCards = [...(donationData?.cards || []), { ...cardForm, id: res.id, URL_imagen: res.URL_imagen || cardForm.URL_imagen }];
      }
      setDonationData(prev => prev ? { ...prev, cards: updatedCards } : null);
      setCardForm({
        titulo_card: "",
        descripcion_card: "",
        URL_imagen: "",
        texto_boton: "",
        color_boton: "#1976d2"
      });
      setCardFile(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving card');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (card: DonationsCard) => {
    setCardForm(card);
    setEditingId(card.id ?? null);
    setValidationErrors({});
    setError(null);
    setCardFile(undefined);
  };

  const handleDeleteCard = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await donationService.deleteCard(id);
      const updatedCards = donationData?.cards.filter(c => c.id !== id) || [];
      setDonationData(prev => prev ? { ...prev, cards: updatedCards } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting card');
    } finally {
      setLoading(false);
    }
  };

  const resetCardForm = () => {
    // Clean up any preview URLs to prevent memory leaks
    if (cardForm.URL_imagen && cardForm.URL_imagen.startsWith('blob:')) {
      URL.revokeObjectURL(cardForm.URL_imagen);
    }
    setCardForm({
      titulo_card: "",
      descripcion_card: "",
      URL_imagen: "",
      texto_boton: "",
      color_boton: "#1976d2"
    });
    setEditingId(null);
    setValidationErrors({});
    setError(null);
    setCardFile(undefined);
  };

  // Modern Color Picker Component
  const ColorPicker = ({ 
    value, 
    onChange, 
    label, 
    className = "" 
  }: { 
    value: string; 
    onChange: (color: string) => void; 
    label: string;
    className?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(50);
    const [lightness, setLightness] = useState(50);

    const predefinedColors = [
      "#1976d2", "#2196f3", "#03a9f4", "#00bcd4", "#009688",
      "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107",
      "#ff9800", "#ff5722", "#f44336", "#e91e63", "#9c27b0",
      "#673ab7", "#3f51b5", "#607d8b", "#795548", "#000000"
    ];

    // Convert HSL to Hex
    const hslToHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.min(k - 3, 9 - k, 1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    // Convert Hex to HSL
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return [h * 360, s * 100, l * 100];
    };

    // Initialize HSL values from current hex value
    useEffect(() => {
      if (value && value.startsWith('#')) {
        const [h, s, l] = hexToHsl(value);
        setHue(h);
        setSaturation(s);
        setLightness(l);
      }
    }, [value]);

    const handleColorChange = (newHue: number, newSat: number, newLight: number) => {
      setHue(newHue);
      setSaturation(newSat);
      setLightness(newLight);
      const hexColor = hslToHex(newHue, newSat, newLight);
      onChange(hexColor);
    };

    const currentColor = hslToHex(hue, saturation, lightness);

    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        
        {/* Color Preview Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:scale-105 transition-transform cursor-pointer"
            style={{ backgroundColor: value }}
            title="Click to open color picker"
          />
          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
        </div>

        {/* Modern Color Picker Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Seleccionar Color</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Color Spectrum */}
              <div className="space-y-4">
                {/* Main Color Picker */}
                <div className="relative">
                  <div
                    className="w-full h-48 rounded-lg border border-gray-300 relative cursor-crosshair"
                    style={{
                      background: `linear-gradient(to right, white, hsl(${hue}, 100%, 50%)), linear-gradient(to bottom, transparent, black)`
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const newSat = Math.round((x / rect.width) * 100);
                      const newLight = Math.round(100 - (y / rect.height) * 100);
                      handleColorChange(hue, Math.max(0, Math.min(100, newSat)), Math.max(0, Math.min(100, newLight)));
                    }}
                  >
                    {/* Crosshair */}
                    <div
                      className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none shadow-lg"
                      style={{
                        left: `${saturation}%`,
                        top: `${100 - lightness}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>

                {/* Hue Slider */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Matiz</label>
                  <div className="relative">
                    <div
                      className="w-full h-6 rounded border border-gray-300 cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const newHue = Math.round((x / rect.width) * 360);
                        handleColorChange(newHue, saturation, lightness);
                      }}
                    />
                    <div
                      className="absolute top-0 w-2 h-6 border-2 border-white rounded pointer-events-none shadow-lg"
                      style={{
                        left: `${(hue / 360) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>

                {/* Value Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Matiz</label>
                    <input
                      type="number"
                      value={Math.round(hue)}
                      onChange={(e) => handleColorChange(Number(e.target.value), saturation, lightness)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      min="0"
                      max="360"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Saturación</label>
                    <input
                      type="number"
                      value={Math.round(saturation)}
                      onChange={(e) => handleColorChange(hue, Number(e.target.value), lightness)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Luminosidad</label>
                    <input
                      type="number"
                      value={Math.round(lightness)}
                      onChange={(e) => handleColorChange(hue, saturation, Number(e.target.value))}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Hex Input */}
                <div>
                  <label className="text-xs text-gray-500">Color HEX</label>
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => {
                      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                        onChange(e.target.value);
                      }
                    }}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 font-mono"
                    placeholder="#000000"
                  />
                </div>

                {/* Predefined Colors */}
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Colores predefinidos</label>
                  <div className="grid grid-cols-10 gap-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                          value === color ? 'border-gray-800 shadow-lg' : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => onChange(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
        await heroService.update(heroData.id, heroData);
      } else {
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
        {/* Hero Section */}
        {section === "hero" && (
          <form onSubmit={handleSubmit}>
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
                    {(heroData?.titulo || " ").length}/100 caracteres
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
                    {(heroData?.descripcion || "").length}/250 caracteres
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
                    {(heroData?.texto_boton_izquierdo || "").length}/50 caracteres
                  </div>
                </div>
                <div>
                  <ColorPicker
                    value={heroData?.color_boton_izquierdo || "#1976d2"}
                    onChange={(color) => handleHeroChange("color_boton_izquierdo", color)}
                    label="Color Botón Izquierdo"
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
                    {(heroData?.texto_boton_derecho || "").length}/50 caracteres
                  </div>
                </div>
                <div>
                  <ColorPicker
                    value={heroData?.color_boton_derecho || "#1976d2"}
                    onChange={(color) => handleHeroChange("color_boton_derecho", color)}
                    label="Color Botón Derecho"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >Cancelar</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >{loading ? "Guardando..." : "Guardar"}</button>
              </div>
            </div>
          </form>
        )}

        {/* About Section */}
        {section === "about" && (
          <form onSubmit={handleSubmit}>
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
                    value={String((data as Record<string, unknown>).titulo || "")}
                    onChange={(e) => handleChange("titulo" as unknown as keyof SectionData, e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).titulo as string || "").length}/100 caracteres
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto botón: 
                  </label>
                  <input
                    value={String((data as Record<string, unknown>).texto_boton || "")}
                    onChange={(e) => handleChange("texto_boton" as unknown as keyof SectionData, e.target.value)}
                    maxLength={50}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).texto_boton as string || "").length}/50 caracteres
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
                {((data as Record<string, unknown>).URL_imagen as string) && (

                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img src={(data as Record<string, unknown>).URL_imagen as string} alt="About preview" className="max-h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción: 
                </label>
                <textarea
                  value={String((data as Record<string, unknown>).descripcion || "")}
                  onChange={(e) => handleChange("descripcion" as unknown as keyof SectionData, e.target.value)}
                  maxLength={500}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((data as Record<string, unknown>).descripcion as string || "").length}/500 caracteres
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ColorPicker
                  value={String((data as Record<string, unknown>).color_boton || "#1976d2")}
                  onChange={(color) => handleChange("color_boton" as unknown as keyof SectionData, color)}
                  label="Color botón"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >Cancelar</button>
                <button
                  type="button"
                  onClick={async () => {
                    const payload = {
                      titulo: String((data as Record<string, unknown>).titulo || ""),
                      URL_imagen: String((data as Record<string, unknown>).URL_imagen || ""),
                      descripcion: String((data as Record<string, unknown>).descripcion || ""),
                      texto_boton: String((data as Record<string, unknown>).texto_boton || ""),
                      color_boton: String((data as Record<string, unknown>).color_boton || "#1976d2"),
                    };
                    const errors = validateAbout(payload);
                    if (Object.keys(errors).length > 0) {
                      setValidationErrors(errors);
                      return;
                    }
                    setValidationErrors({});
                    try {
                      const existing = await aboutService.getAll().then(list => list[0]).catch(() => undefined);
                      if (existing && existing.id) {
                        await aboutService.update(existing.id, payload as AboutSection);
                      } else {
                        await aboutService.create(payload as Omit<AboutSection, 'id'>);
                      }
                      onSave(data);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                >Guardar</button>
              </div>
            </div>
          </form>
        )}

        {/* Volunteering Section */}
        {section === "volunteering" && (
          <form onSubmit={handleSubmit}>
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
                    value={String((data as Record<string, unknown>).titulo || "")}
                    onChange={(e) => handleChange("titulo" as unknown as keyof SectionData, e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).titulo as string || "").length}/100 caracteres
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo: 
                  </label>
                  <input
                    value={String((data as Record<string, unknown>).subtitulo || "")}
                    onChange={(e) => handleChange("subtitulo" as unknown as keyof SectionData, e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {((data as Record<string, unknown>).subtitulo as string || "").length}/100 caracteres
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción: 
                </label>
              <textarea
                  value={String((data as Record<string, unknown>).descripcion || "")}

                  onChange={(e) => handleChange("descripcion" as unknown as keyof SectionData, e.target.value)}
                  maxLength={500}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {((data as Record<string, unknown>).descripcion as string || "").length}/500 caracteres
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
                {((data as Record<string, unknown>).URL_imagen as string) && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <img src={(data as Record<string, unknown>).URL_imagen as string} alt="Volunteer preview" className="max-h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto botón: 
                  </label>
                  <input
                    value={String((data as Record<string, unknown>).texto_boton || "")}
                    onChange={(e) => handleChange("texto_boton" as unknown as keyof SectionData, e.target.value)}
                    maxLength={50}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">

                      {((data as Record<string, unknown>).texto_boton as string || "").length}/50 caracteres

                  </div>
                </div>
                <div>
                  <ColorPicker
                    value={String((data as Record<string, unknown>).color_boton || "#1976d2")}
                    onChange={(color) => handleChange("color_boton" as unknown as keyof SectionData, color)}
                    label="Color botón"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >Cancelar</button>
                <button
                  type="button"
                  onClick={async () => {
                    const payload = {
                      titulo: String((data as Record<string, unknown>).titulo || ""),
                      subtitulo: String((data as Record<string, unknown>).subtitulo || ""),
                      descripcion: String((data as Record<string, unknown>).descripcion || ""),
                      URL_imagen: String((data as Record<string, unknown>).URL_imagen || ""),
                      texto_boton: String((data as Record<string, unknown>).texto_boton || ""),
                      color_boton: String((data as Record<string, unknown>).color_boton || "#1976d2"),
                    };
                    const errors = validateVolunteer(payload);
                    if (Object.keys(errors).length > 0) {
                      setValidationErrors(errors);
                      return;
                    }
                    setValidationErrors({});
                    try {
                      const existing = await volunteerLandingService.getAll().then(list => list[0]).catch(() => undefined);
                      if (existing && existing.id) {
                        await volunteerLandingService.update(existing.id, payload as LandingVolunteer);
                      } else {
                        await volunteerLandingService.create(payload as LandingVolunteer);
                      }
                      onSave(data);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                >Guardar</button>
              </div>
            </div>
          </form>
        )}

        {/* Donation Section */}
        {section === "donation" && (
            <div className="mt-4 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Personalizar donaciones</h2>
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
              
              {/* Header Section */}
              <div className="p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Encabezado de la Sección</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título: 
                    </label>
                    <input
                      value={donationData?.header?.titulo || ""}
                      onChange={(e) => handleDonationHeaderChange("titulo", e.target.value)}
                      maxLength={150}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(donationData?.header?.titulo || "").length}/150 caracteres
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción: 
                    </label>
                    <textarea
                      value={donationData?.header?.descripcion || ""}
                      onChange={(e) => handleDonationHeaderChange("descripcion", e.target.value)}
                      maxLength={250}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(donationData?.header?.descripcion || "").length}/250 caracteres
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!donationData?.header) return;
                      try {
                        setLoading(true);
                        if (donationData.header.id) {
                          await donationService.updateHeader(donationData.header);
                        } else {
                          const result = await donationService.createHeader({
                            titulo: donationData.header.titulo,
                            descripcion: donationData.header.descripcion
                          });
                          setDonationData(prev => prev ? {
                            ...prev,
                            header: { ...prev.header, id: result.id }
                          } : null);
                        }
                        setError(null);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Error saving header');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                  >{loading ? "Guardando..." : "Guardar Header"}</button>
                </div>
              </div>

              {/* Card Form Section */}
              <div className="p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-4">
                  {editingId ? "Editar Card" : "Agregar Nueva Card"}
                </h3>
                <form onSubmit={handleCardSubmit} className="space-y-6">
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
                        Título Card:
                      </label>
                      <input
                        value={cardForm.titulo_card}
                        onChange={e => handleCardFormChange("titulo_card", e.target.value)}
                        maxLength={100}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {cardForm.titulo_card.length}/100 caracteres
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción Card:
                      </label>
                      <textarea
                        value={cardForm.descripcion_card}
                        onChange={e => handleCardFormChange("descripcion_card", e.target.value)}
                        maxLength={250}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full h-16 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {cardForm.descripcion_card.length}/250 caracteres
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Subir imagen (opcional):</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCardFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    {cardForm.URL_imagen && (
                      <div className="mt-3 flex flex-col items-center">
                        <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                        <img
                          src={cardForm.URL_imagen}
                          alt="Vista previa donación"
                          className="max-h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm"
                          style={{ maxWidth: 320 }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto Botón:
                      </label>
                      <input
                        value={cardForm.texto_boton}
                        onChange={e => handleCardFormChange("texto_boton", e.target.value)}
                        maxLength={100}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {cardForm.texto_boton.length}/100 caracteres
                      </div>
                    </div>
                    <div>
                      <ColorPicker
                        value={cardForm.color_boton || "#1976d2"}
                        onChange={(color) => handleCardFormChange("color_boton", color)}
                        label="Color Botón"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={resetCardForm}
                      className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                    >Cancelar</button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >{editingId ? "Actualizar Card" : "Agregar Card"}</button>
                  </div>
                </form>
              </div>

              {/* Existing Cards Section */}
              <div className="p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Cards Existentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {donationData?.cards?.map(card => (
                    <div key={card.id} className="bg-white p-4 rounded shadow border border-gray-200">
                      {card.URL_imagen && (
                        <img 
                          src={card.URL_imagen} 
                          className="w-full h-32 object-cover mb-2 rounded" 
                          alt={card.titulo_card}
                        />
                      )}
                      <h3 className="font-bold text-lg">{card.titulo_card}</h3>
                      <p className="text-gray-600 text-sm mb-2">{card.descripcion_card}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">Color botón:</span>
                        <div 
                          className="w-6 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: card.color_boton }}
                        ></div>
                        <span className="font-mono text-sm">{card.color_boton}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Botón: {card.texto_boton}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditCard(card)} 
                          className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white text-sm rounded transition-colors duration-200"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteCard(card.id!)} 
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors duration-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!donationData?.cards || donationData.cards.length === 0) && (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                      No hay cards de donación creadas aún.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >Cancelar</button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!donationData) return;
                    try {
                      setLoading(true);
                      
                      // Update header
                      if (donationData.header?.id) {
                        await donationService.updateHeader(donationData.header);
                      } else {
                        const result = await donationService.createHeader({
                          titulo: donationData.header?.titulo || "",
                          descripcion: donationData.header?.descripcion || ""
                        });
                        setDonationData(prev => prev ? {
                          ...prev,
                          header: { ...prev.header, id: result.id }
                        } : null);
                      }
                      
                      // Update cards
                      for (const card of donationData.cards || []) {
                        if (card.id) {
                          await donationService.updateCard(card.id, card);
                        } else {
                          await donationService.createCard(card);
                        }
                      }
                      
                      onSave(donationData as unknown as SectionData);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Error saving donation data');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >{loading ? "Guardando..." : "Guardar"}</button>
              </div>
            </div>
          )}

        {/* Location Section */}
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

          {/* Testimonials Section */}
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

          {/* Footer Section */}
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
      </div>
    </ModalSimple>
  );
}