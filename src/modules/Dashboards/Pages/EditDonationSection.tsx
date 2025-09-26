import React, { useState, useEffect } from "react";
import { donationService, type DonationSection, type DonationsCard } from "../../Dashboards/Services/donationService";

interface Props {
  initialData: DonationSection;
  onSave: (data: DonationSection) => void;
  onCancel: () => void;
  onUpdate: (partial: Partial<DonationSection>) => void;
}

const defaultCardForm: DonationsCard = {
  titulo_card: "",
  descripcion_card: "",
  URL_imagen: "",
  texto_boton: "",
  color_boton: "#1976d2"
};

const EditDonationSection: React.FC<Props> = ({ initialData, onSave, onCancel, onUpdate }) => {
  const [header, setHeader] = useState(initialData.header);
  const [cards, setCards] = useState<DonationsCard[]>(initialData.cards);
  const [cardForm, setCardForm] = useState<DonationsCard>(defaultCardForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sincroniza el estado cuando cambia el initialData (al abrir/cerrar el modal, etc)
  useEffect(() => {
    setHeader(initialData.header);
    setCards(initialData.cards);
    setCardForm(defaultCardForm);
    setEditingId(null);
    setMessage(null);
    setValidationErrors({});
  }, [initialData]);

  // --- Header handlers ---
  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };

  const handleHeaderSave = async () => {
    setLoading(true);
    setMessage(null);
    if (!header.titulo || header.titulo.length > 150) {
      setMessage("El título es obligatorio y no debe exceder 150 caracteres.");
      setLoading(false);
      return;
    }
    if (!header.descripcion) {
      setMessage("La descripción es obligatoria.");
      setLoading(false);
      return;
    }
    try {
      await donationService.updateHeader(header);
      setMessage("Header actualizado correctamente.");
      onUpdate({ header });
    } catch {
      setMessage("Error al actualizar el header.");
    } finally {
      setLoading(false);
    }
  };

  // --- Card handlers ---
  const handleCardChange = (field: keyof DonationsCard, value: string) => {
    setCardForm(prev => ({ ...prev, [field]: value }));
  };

  const validateCard = (card: DonationsCard) => {
    const errors: Record<string, string> = {};
    if (!card.titulo_card || card.titulo_card.length > 100) errors.titulo_card = "Título requerido y máximo 100 caracteres";
    if (!card.descripcion_card || card.descripcion_card.length > 100) errors.descripcion_card = "Descripción requerida y máximo 100 caracteres";
    if (!card.URL_imagen || card.URL_imagen.length > 255) errors.URL_imagen = "URL de imagen requerida y máximo 255 caracteres";
    if (!card.texto_boton || card.texto_boton.length > 100) errors.texto_boton = "Texto botón requerido y máximo 100 caracteres";
    if (!card.color_boton || card.color_boton.length > 20) errors.color_boton = "Color botón requerido y máximo 20 caracteres";
    return errors;
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setMessage(null);
    const errors = validateCard(cardForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setLoading(true);
    try {
      let updatedCards;
      if (editingId) {
        await donationService.updateCard(editingId, cardForm);
        updatedCards = cards.map(c => c.id === editingId ? { ...cardForm, id: editingId } : c);
        setMessage("Card editada correctamente.");
        setEditingId(null);
      } else {
        const { id } = await donationService.createCard(cardForm);
        updatedCards = [...cards, { ...cardForm, id }];
        setMessage("Card agregada correctamente.");
      }
      setCards(updatedCards);
      setCardForm(defaultCardForm);
      onUpdate({ cards: updatedCards });
    } catch {
      setMessage("Error al guardar la card.");
    }
    setLoading(false);
  };

  const handleEditCard = (card: DonationsCard) => {
    setCardForm(card);
    setEditingId(card.id ?? null);
    setValidationErrors({});
    setMessage(null);
  };

  const handleDeleteCard = async (id: number) => {
    setLoading(true);
    setMessage(null);
    try {
      await donationService.deleteCard(id);
      const updatedCards = cards.filter(c => c.id !== id);
      setCards(updatedCards);
      setMessage("Card eliminada correctamente.");
      onUpdate({ cards: updatedCards });
    } catch {
      setMessage("Error al eliminar la card.");
    }
    setLoading(false);
  };

  // ----------- UI STARTS HERE (CONTENEDOR MODAL SIN FONDO NEGRO) -----------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 overflow-y-auto max-h-[90vh]">
        {/* Equis para cerrar */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold transition"
          aria-label="Cerrar"
        >
          &times;
        </button>
        {/* Header de Donaciones */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Personalizar Donaciones</h2>
          {loading && <div className="text-blue-600">Cargando datos...</div>}
          {message && <div className={`mb-2 px-4 py-2 rounded text-sm ${
            message?.toLowerCase().includes("error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}>{message}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título: (máximo 150 caracteres)
              </label>
              <input
                value={header.titulo || ""}
                onChange={(e) => handleHeaderChange(e)}
                name="titulo"
                maxLength={150}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {(header.titulo || "").length}/150 caracteres
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción: (máximo 250 caracteres)
              </label>
              <textarea
                value={header.descripcion || ""}
                onChange={(e) => handleHeaderChange(e)}
                name="descripcion"
                maxLength={250}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                {(header.descripcion || "").length}/250 caracteres
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >Cancelar</button>
            <button
              type="button"
              disabled={loading}
              onClick={handleHeaderSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >{loading ? "Guardando..." : "Guardar Header"}</button>
          </div>
        </div>

        {/* Cards de Donaciones */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Cards de Donaciones</h2>
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
                  Título Card: (máximo 100 caracteres)
                </label>
                <input
                  value={cardForm.titulo_card}
                  onChange={e => handleCardChange("titulo_card", e.target.value)}
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
                  Descripción Card: (máximo 100 caracteres)
                </label>
                <input
                  value={cardForm.descripcion_card}
                  onChange={e => handleCardChange("descripcion_card", e.target.value)}
                  maxLength={100}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {cardForm.descripcion_card.length}/100 caracteres
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Subir imagen (opcional):</label>
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
                      setCardForm(prev => ({ ...prev, URL_imagen: url }));
                    } catch (err) {
                      setMessage("Error al subir la imagen.");
                    }
                  }}
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
                  Texto Botón: (máximo 100 caracteres)
                </label>
                <input
                  value={cardForm.texto_boton}
                  onChange={e => handleCardChange("texto_boton", e.target.value)}
                  maxLength={100}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {cardForm.texto_boton.length}/100 caracteres
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Botón: (máx 20 caracteres)
                </label>
                <input
                  type="color"
                  value={cardForm.color_boton || "#1976d2"}
                  onChange={e => handleCardChange("color_boton", e.target.value)}
                  className="w-20 h-10 rounded-lg border border-gray-300"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setCardForm(defaultCardForm);
                  setEditingId(null);
                  setValidationErrors({});
                  setMessage(null);
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >Cancelar</button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >{editingId ? "Actualizar Card" : "Agregar Card"}</button>
            </div>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {cards.map(card => (
              <div key={card.id} className="bg-gray-100 p-4 rounded shadow">
                <img src={card.URL_imagen} className="w-full h-32 object-cover mb-2 rounded" alt={card.titulo_card}/>
                <h3 className="font-bold">{card.titulo_card}</h3>
                <p>{card.descripcion_card}</p>
                <span className="text-sm">Color botón: <span className="font-mono">{card.color_boton}</span></span>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEditCard(card)} className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white">Editar</button>
                  <button onClick={() => handleDeleteCard(card.id!)} className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => onSave({ header, cards })}>
              Guardar Cambios
            </button>
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDonationSection;