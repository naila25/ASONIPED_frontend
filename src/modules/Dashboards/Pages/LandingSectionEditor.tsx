import React, { useState, useEffect, useRef, useCallback } from "react";
import type { SectionData, SectionKey, TestimonialItem, ValueItem } from "../Types/types";
import { historiasLandingService, type HistoriasHeader } from "../Services/historiasLandingService";
import { ColorPicker } from "./ColorPicker";
import { ModalSimple } from "./ModalSimple.tsx";
import { heroService, type HeroSection } from "../Services/heroService.ts";
import { aboutService, type AboutSection } from "../Services/aboutService";
import { volunteerLandingService, type LandingVolunteer } from "../Services/volunteerLandingService";
import { donationService, type DonationSection, type DonationsCard } from "../Services/donationService";
import type { LandingWorkshop } from "../Types/types";

// Extiendo ValueItem para incluir id, que es necesario para edición y eliminación
type ValueItemWithId = ValueItem & { id: string };

/** Coincide con `text-orange-600` en el sitio público; el color del título no es editable en el CMS. */
const HISTORIAS_TITULO_COLOR_FIJO = "#ea580c";

function createDefaultHistoriasHeader(): HistoriasHeader {
  return {
    titulo: "Testimonios de Vida",
    descripcion:
      "Descubre cómo la voz de quienes forman parte de ASONIPED refleja esperanza, inclusión y superación, a través de experiencias que inspiran y motivan a toda nuestra comunidad.",
    color_titulo: HISTORIAS_TITULO_COLOR_FIJO,
  };
}

export function LandingSectionEditor({
  section,
  initialData,
  onSave,
  onCancel,
  onUpdate,
}: {
  section: SectionKey;
  initialData: SectionData | LandingWorkshop;
  onSave: (data: SectionData | LandingWorkshop) => void;
  onCancel: () => void;
  onUpdate: (partial: Partial<SectionData> | Partial<LandingWorkshop>) => void;
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
    values: 'values' in initialData ? addIdToValues(initialData.values) : [],
  } as SectionData);

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const MAX_DONATION_CARDS = 3;
  const MAX_HISTORIAS_ITEMS = 12;
  const donationMessageRef = useRef<HTMLDivElement | null>(null);
  const [historiasData, setHistoriasData] = useState<{
    header: HistoriasHeader;
    items: TestimonialItem[];
  } | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    videoUrl: "",
    orden: 0,
  });
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [historiasHeaderErrors, setHistoriasHeaderErrors] = useState<Record<string, string>>({});
  // Estado específico para workshop section del backend
  const [workshopData, setWorkshopData] = useState<LandingWorkshop>(
    section === "workshop"
      ? (initialData as LandingWorkshop)
      : {
        titulo: "",
        titulo_card: "",
        descripcion_card: "",
        imagen_card: "",
        texto_boton_card: "",
        color_boton_card: "#ff6600",
        fondo: "",
      }
  );

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

  // Validation for workshop section
  const validateWorkshop = (data: LandingWorkshop): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.titulo || data.titulo.length < 3 || data.titulo.length > 150) errors.titulo = "Título requerido y debe tener entre 3 y 150 caracteres";
    if (!data.titulo_card || data.titulo_card.length < 3 || data.titulo_card.length > 150) errors.titulo_card = "Título de tarjeta requerido y debe tener entre 3 y 150 caracteres";
    if (!data.descripcion_card || data.descripcion_card.length < 5 || data.descripcion_card.length > 255) errors.descripcion_card = "Descripción requerida y debe tener entre 5 y 255 caracteres";
    if (!data.imagen_card || data.imagen_card.length < 5 || data.imagen_card.length > 255) errors.imagen_card = "Imagen requerida y debe tener entre 5 y 255 caracteres";
    if (!data.texto_boton_card || data.texto_boton_card.length < 1 || data.texto_boton_card.length > 100) errors.texto_boton_card = "Texto botón requerido y debe tener entre 1 y 100 caracteres";
    if (!data.color_boton_card || data.color_boton_card.length < 1 || data.color_boton_card.length > 20) errors.color_boton_card = "Color botón requerido y máximo 20 caracteres";
    if (!data.fondo || data.fondo.length < 1 || data.fondo.length > 255) errors.fondo = "Fondo requerido y debe tener entre 1 y 255 caracteres";
    return errors;
  };

  // Reset local `data` when switching section only. Parent `initialData` changes on every keystroke
  // (via onUpdate → GestionLanding); depending on it here caused redundant setState and work on each keypress.
  useEffect(() => {
    if (section === "hero" || section === "about" || section === "volunteering" || section === "testimonials") {
      return;
    }
    setData({
      ...initialData,
      values: "values" in initialData ? addIdToValues(initialData.values) : [],
    } as SectionData);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: sync from props only when `section` changes (modal key remounts per open)
  }, [section]);

  const loadHistoriasData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { header, items } = await historiasLandingService.getSection();
      setHistoriasHeaderErrors({});
      setValidationErrors({});
      setHistoriasData({
        header: header
          ? { ...header, color_titulo: HISTORIAS_TITULO_COLOR_FIJO }
          : createDefaultHistoriasHeader(),
        items,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading historias data");
      setHistoriasData({ header: createDefaultHistoriasHeader(), items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

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
            setData(prev => ({
              ...prev,
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
            setData(prev => ({
              ...prev,
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
    if (section === "testimonials") {
      loadHistoriasData();
    }
  }, [section, loadHistoriasData]);

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

  // Handlers específicos para workshop section
  const handleWorkshopChange = (field: keyof LandingWorkshop, value: string) => {
    setWorkshopData(prev => ({ ...prev, [field]: value }));
    onUpdate({ [field]: value } as Partial<LandingWorkshop>);
  };

  // Card form handlers
  const handleCardFormChange = (field: keyof DonationsCard, value: string) => {
    setCardForm(prev => ({ ...prev, [field]: value }));
  };


  // Submit card (create or update)
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const cardsCount = donationData?.cards?.length || 0;
    const isCreating = !editingId;
    if (isCreating && cardsCount >= MAX_DONATION_CARDS) {
      setError(`Solo se permiten ${MAX_DONATION_CARDS} cards de donaciones.`);
      setTimeout(() => {
        donationMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    const errors = validateCard(cardForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setLoading(true);
    try {
      let updatedCards;
      if (editingId) {
        const res = await donationService.updateCard(editingId, cardForm);
        updatedCards = donationData?.cards.map(c =>
          c.id === editingId
            ? { ...cardForm, id: editingId, URL_imagen: res.URL_imagen || cardForm.URL_imagen }
            : c
        ) || [];
        setEditingId(null);
      } else {
        const res = await donationService.createCard(cardForm);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving card');
    } finally {
      setLoading(false);
    }
  };

  // Submit workshop
  const handleWorkshopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateWorkshop(workshopData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    onSave(workshopData);
  };

  // Handlers específicos para workshop section
  const handleEditCard = (card: DonationsCard) => {
    setCardForm(card);
    setEditingId(card.id ?? null);
    setValidationErrors({});
    setError(null);
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
  };

  const handleHistoriasHeaderChange = (field: keyof HistoriasHeader, value: string) => {
    setHistoriasHeaderErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
    setHistoriasData((prev) =>
      prev
        ? { ...prev, header: { ...prev.header, [field]: value } }
        : null
    );
  };

  const handleItemFormChange = (field: keyof typeof itemForm, value: string | number) => {
    setItemForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  };

  /** Alineado con landing-historias-component (backend). */
  const validateHistoriasHeader = (header: HistoriasHeader): Record<string, string> => {
    const errors: Record<string, string> = {};
    const titulo = header.titulo?.trim() ?? "";
    if (titulo.length < 3 || titulo.length > 150) {
      errors.titulo = "El título debe tener entre 3 y 150 caracteres.";
    }
    const descripcion = header.descripcion ?? "";
    if (!descripcion.trim()) {
      errors.descripcion = "La descripción es obligatoria.";
    } else if (descripcion.length > 2000) {
      errors.descripcion = "La descripción no puede superar 2000 caracteres.";
    }
    return errors;
  };

  /** Alineado con landing-historias-item (backend). */
  const validateHistoriasItem = () => {
    const errors: Record<string, string> = {};
    const name = itemForm.name.trim();
    if (!name || name.length > 255) {
      errors.name = "Nombre requerido (máx. 255 caracteres).";
    }
    const desc = itemForm.description.trim();
    if (!desc) {
      errors.description = "La historia es obligatoria.";
    } else if (desc.length > 8000) {
      errors.description = "La historia no puede superar 8000 caracteres.";
    }
    const rawVideo = itemForm.videoUrl.trim();
    if (rawVideo) {
      if (rawVideo.length > 500) {
        errors.videoUrl = "La URL no puede superar 500 caracteres.";
      } else {
        try {
          const u = new URL(rawVideo);
          if (u.protocol !== "http:" && u.protocol !== "https:") {
            errors.videoUrl = "La URL del video debe ser http(s).";
          }
        } catch {
          errors.videoUrl = "URL de video no válida.";
        }
      }
    }
    if (!Number.isFinite(itemForm.orden) || itemForm.orden < 0) {
      errors.orden = "El orden debe ser un número mayor o igual a 0.";
    }
    return errors;
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const count = historiasData?.items.length ?? 0;
    const isCreating = editingItemId === null;
    if (isCreating && count >= MAX_HISTORIAS_ITEMS) {
      setError(`Solo se permiten ${MAX_HISTORIAS_ITEMS} testimonios.`);
      return;
    }

    const errors = validateHistoriasItem();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload = {
      nombre: itemForm.name.trim(),
      historia: itemForm.description.trim(),
      video_url: itemForm.videoUrl.trim() || null,
      orden: itemForm.orden,
    };

    setLoading(true);
    try {
      if (editingItemId != null) {
        await historiasLandingService.updateItem(editingItemId, payload);
        setEditingItemId(null);
      } else {
        await historiasLandingService.createItem(payload);
      }
      await loadHistoriasData();
      setItemForm({ name: "", description: "", videoUrl: "", orden: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar testimonio");
    } finally {
      setLoading(false);
    }
  };

  const handleEditHistoriasItem = (item: TestimonialItem) => {
    setItemForm({
      name: item.name,
      description: item.description,
      videoUrl: item.videoUrl || "",
      orden: item.orden ?? 0,
    });
    setEditingItemId(Number(item.id));
    setValidationErrors({});
    setError(null);
  };

  const handleDeleteHistoriasItem = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await historiasLandingService.deleteItem(Number(id));
      await loadHistoriasData();
      if (editingItemId === Number(id)) {
        setEditingItemId(null);
        setItemForm({ name: "", description: "", videoUrl: "", orden: 0 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar testimonio");
    } finally {
      setLoading(false);
    }
  };

  const resetItemForm = () => {
    setItemForm({ name: "", description: "", videoUrl: "", orden: 0 });
    setEditingItemId(null);
    setValidationErrors({});
    setError(null);
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
                <label className="block text-sm font-medium text-gray-700">URL de la Imagen (Cloudinary):</label>
                <input
                  type="url"
                  value={heroData?.url_imagen || ""}
                  onChange={(e) => handleHeroChange("url_imagen", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500">
                  Pega aquí la URL de la imagen desde Cloudinary
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
              <h2 className="text-2xl font-bold mb-4">Personalizar Sobre Nosotros</h2>
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
                <label className="block text-sm font-medium text-gray-700">URL de la Imagen (Cloudinary):</label>
                <input
                  type="url"
                  value={String((data as Record<string, unknown>).URL_imagen || "")}
                  onChange={(e) => handleChange("URL_imagen" as unknown as keyof SectionData, e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500">
                  Pega aquí la URL de la imagen desde Cloudinary
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


        {/* Workshop Section */}
        {section === "workshop" && (
          <form onSubmit={handleWorkshopSubmit}>
            <div className="mt-4 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Personalizar taller</h2>
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
                    value={workshopData.titulo}
                    onChange={(e) => handleWorkshopChange("titulo", e.target.value)}
                    maxLength={150}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {workshopData.titulo.length}/150 caracteres
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título tarjeta:
                  </label>
                  <input
                    value={workshopData.titulo_card}
                    onChange={(e) => handleWorkshopChange("titulo_card", e.target.value)}
                    maxLength={150}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {workshopData.titulo_card.length}/150 caracteres
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción tarjeta:
                </label>
                <textarea
                  value={workshopData.descripcion_card}
                  onChange={(e) => handleWorkshopChange("descripcion_card", e.target.value)}
                  maxLength={255}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {workshopData.descripcion_card.length}/255 caracteres
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Imagen (Cloudinary):
                </label>
                <input
                  type="url"
                  value={workshopData.imagen_card}
                  onChange={(e) => handleWorkshopChange("imagen_card", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Pega aquí la URL de la imagen desde Cloudinary
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                  {workshopData.imagen_card && (
                    <img src={workshopData.imagen_card} alt="Workshop preview" className="max-h-48 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto botón tarjeta:
                  </label>
                  <input
                    value={workshopData.texto_boton_card}
                    onChange={(e) => handleWorkshopChange("texto_boton_card", e.target.value)}
                    maxLength={100}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {workshopData.texto_boton_card.length}/100 caracteres
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color botón tarjeta:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={workshopData.color_boton_card}
                      onChange={(e) => handleWorkshopChange("color_boton_card", e.target.value)}
                      className="border border-gray-300 rounded-lg w-12 h-12"
                      required
                    />
                    <input
                      type="text"
                      value={workshopData.color_boton_card}
                      onChange={(e) => handleWorkshopChange("color_boton_card", e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-24 font-mono"
                      maxLength={20}
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fondo (URL o color):
                </label>
                <input
                  value={workshopData.fondo}
                  onChange={(e) => handleWorkshopChange("fondo", e.target.value)}
                  maxLength={255}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {workshopData.fondo.length}/255 caracteres
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar
                </button>
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
                <label className="block text-sm font-medium text-gray-700">URL de la Imagen (Cloudinary):</label>
                <input
                  type="url"
                  value={String((data as Record<string, unknown>).URL_imagen || "")}
                  onChange={(e) => handleChange("URL_imagen" as unknown as keyof SectionData, e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500">
                  Pega aquí la URL de la imagen desde Cloudinary
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
            {error && (
              <div ref={donationMessageRef} className="text-red-600 font-medium">
                Error: {error}
              </div>
            )}
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
              <p className="text-sm text-gray-600 mb-4">
                Cards creadas: <span className="font-semibold">{donationData?.cards?.length || 0}/{MAX_DONATION_CARDS}</span>
              </p>
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
                  <label className="block text-sm font-medium text-gray-700">URL de la Imagen (Cloudinary):</label>
                  <input
                    type="url"
                    value={cardForm.URL_imagen}
                    onChange={(e) => handleCardFormChange("URL_imagen", e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500">
                    Pega aquí la URL de la imagen desde Cloudinary
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

        {/* Testimonials / Historias de vida */}
        {section === "testimonials" && !historiasData && (
          <div className="mt-4 py-12 text-center text-gray-600">
            {loading ? "Cargando testimonios..." : "No se pudieron cargar los datos."}
          </div>
        )}
        {section === "testimonials" && historiasData && (
          <div className="mt-4 space-y-6">
            <h2 className="text-2xl font-bold mb-2">Testimonios (Historias de vida)</h2>
            {loading && <div className="text-blue-600">Cargando datos...</div>}
            {error && <div className="text-red-600 font-medium">Error: {error}</div>}

            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Encabezado</h3>
              {Object.keys(historiasHeaderErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <ul className="text-red-700 text-sm space-y-1">
                    {Object.entries(historiasHeaderErrors).map(([field, message]) => (
                      <li key={field}>• {message}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    value={historiasData.header.titulo}
                    onChange={(e) => handleHistoriasHeaderChange("titulo", e.target.value)}
                    maxLength={150}
                    className={`border rounded-lg px-3 py-2 w-full ${
                      historiasHeaderErrors.titulo ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                    }`}
                  />
                  {historiasHeaderErrors.titulo && (
                    <p className="text-red-600 text-xs mt-1">{historiasHeaderErrors.titulo}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {(historiasData.header.titulo || "").length}/150 caracteres
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción / subtítulo</label>
                  <textarea
                    value={historiasData.header.descripcion}
                    onChange={(e) => handleHistoriasHeaderChange("descripcion", e.target.value)}
                    maxLength={500}
                    rows={4}
                    className={`border rounded-lg px-3 py-2 w-full ${
                      historiasHeaderErrors.descripcion ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                    }`}
                  />
                  {historiasHeaderErrors.descripcion && (
                    <p className="text-red-600 text-xs mt-1">{historiasHeaderErrors.descripcion}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {(historiasData.header.descripcion || "").length}/500 caracteres
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (!historiasData) return;
                    const headerErrs = validateHistoriasHeader(historiasData.header);
                    if (Object.keys(headerErrs).length > 0) {
                      setHistoriasHeaderErrors(headerErrs);
                      setError(null);
                      return;
                    }
                    setHistoriasHeaderErrors({});
                    try {
                      setLoading(true);
                      setError(null);
                      if (historiasData.header.id) {
                        await historiasLandingService.updateHeader({
                          ...historiasData.header,
                          color_titulo: HISTORIAS_TITULO_COLOR_FIJO,
                        });
                      } else {
                        const result = await historiasLandingService.createHeader({
                          titulo: historiasData.header.titulo,
                          descripcion: historiasData.header.descripcion,
                          color_titulo: HISTORIAS_TITULO_COLOR_FIJO,
                        });
                        setHistoriasData((prev) =>
                          prev ? { ...prev, header: { ...prev.header, id: result.id } } : null
                        );
                      }
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Error al guardar encabezado");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar encabezado"}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-2">{editingItemId ? "Editar testimonio" : "Agregar testimonio"}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Testimonios: {historiasData.items.length}/{MAX_HISTORIAS_ITEMS}
              </p>
              <form onSubmit={handleItemSubmit} className="space-y-4">
                {Object.keys(validationErrors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <ul className="text-red-700 text-sm space-y-1">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <li key={field}>• {message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    value={itemForm.name}
                    onChange={(e) => handleItemFormChange("name", e.target.value)}
                    maxLength={255}
                    className={`border rounded-lg px-3 py-2 w-full ${
                      validationErrors.name ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Historia</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => handleItemFormChange("description", e.target.value)}
                    rows={5}
                    maxLength={500}
                    className={`border rounded-lg px-3 py-2 w-full ${
                      validationErrors.description ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.description && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {itemForm.description.length}/500 caracteres
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de video (YouTube)
                  </label>
                  <input
                    type="url"
                    value={itemForm.videoUrl}
                    onChange={(e) => handleItemFormChange("videoUrl", e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    maxLength={500}
                    className={`border rounded-lg px-3 py-2 w-full ${
                      validationErrors.videoUrl ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.videoUrl && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.videoUrl}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input
                    type="number"
                    min={0}
                    value={itemForm.orden}
                    onChange={(e) =>
                      handleItemFormChange("orden", parseInt(e.target.value, 10) || 0)
                    }
                    className={`border rounded-lg px-3 py-2 w-32 ${
                      validationErrors.orden ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.orden && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.orden}</p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetItemForm}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingItemId ? "Actualizar" : "Agregar"}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Testimonios publicados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historiasData.items.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded shadow border border-gray-200">
                    <h4 className="font-bold text-lg">{item.name}</h4>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-2">{item.description}</p>
                    {item.videoUrl && (
                      <p className="text-xs text-blue-600 truncate mb-2" title={item.videoUrl}>
                        {item.videoUrl}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditHistoriasItem(item)}
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white text-sm rounded"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHistoriasItem(item.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                {historiasData.items.length === 0 && (
                  <p className="text-gray-500 col-span-2 text-center py-6">
                    No hay testimonios guardados. La sección en el sitio solo aparece cuando hay al menos un encabezado
                    guardado o un testimonio publicado.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!historiasData) return;
                  onSave({
                    ...data,
                    testimonialsTitle: historiasData.header.titulo,
                    testimonialsDescription: historiasData.header.descripcion,
                    testimonialsTitleColor: HISTORIAS_TITULO_COLOR_FIJO,
                    testimonials: historiasData.items,
                  } as SectionData);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar y cerrar
              </button>
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