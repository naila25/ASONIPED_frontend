import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

// Asegúrate de que las rutas de importación de tus tipos sean correctas
import { SectionData, SectionKey, ValueItem, VolunteerType, TestimonialItem, FooterData } from "./types";
import { ModalSimple } from "./ModalSimple";

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
      if ((v as any).id) return v as ValueItemWithId;
      return { ...v, id: String(Date.now()) + "_" + i };
    });
  };

  // Estado local con valores con id en values
  const [data, setData] = useState<SectionData>({
    ...initialData,
    values: addIdToValues(initialData.values),
  });

  useEffect(() => {
    setData({
      ...initialData,
      values: addIdToValues(initialData.values),
    });
  }, [initialData]);

  const handleChange = (field: keyof SectionData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate({ [field]: value });
  };

  const handleNestedChange = (parentField: keyof SectionData, field: string, value: any) => {
    const parentData = (data[parentField] as any) || {};
    const newData = {
      ...data,
      [parentField]: { ...parentData, [field]: value }
    };
    setData(newData);
    onUpdate({ [parentField]: newData[parentField] });
  };

  const handleAddArrayItem = (field: "values" | "volunteerTypes" | "testimonials") => {
    if (field === "values") {
      const newItem: ValueItemWithId = { id: String(Date.now()), icon: "", label: "Nuevo valor", text: "", position: "left" };
      handleChange(field, [...(data.values || []), newItem]);
    } else if (field === "volunteerTypes") {
      const newItem: VolunteerType = { id: String(Date.now()), title: "Nuevo tipo", description: "", skills: [], tools: [], date: "", location: "", formEditable: false, formQuestions: [] };
      handleChange(field, [...(data.volunteerTypes || []), newItem]);
    } else if (field === "testimonials") {
      const newItem: TestimonialItem = { id: String(Date.now()), videoUrl: "", name: "", description: "" };
      handleChange(field, [...(data.testimonials || []), newItem]);
    }
  };

  const handleRemoveArrayItem = (field: "values" | "volunteerTypes" | "testimonials", id: string) => {
    handleChange(field, (data[field] || []).filter((item: any) => item.id !== id));
  };

  const handleUpdateArrayItem = (field: "values" | "volunteerTypes" | "testimonials", id: string, partial: any) => {
    handleChange(field, (data[field] || []).map((item: any) => item.id === id ? { ...item, ...partial } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <ModalSimple onClose={onCancel}>
      <div className="p-4 space-y-4 max-w-2xl overflow-auto">
        <h2 className="text-xl font-bold mb-4">Editar Sección: {section}</h2>
        <form onSubmit={handleSubmit}>
          {/* Campos comunes para todas las secciones */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={data.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color del Título</label>
              <input
                type="color"
                value={data.titleColor || "#000000"}
                onChange={(e) => handleChange("titleColor", e.target.value)}
                className="mt-1 block w-full h-10 rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color de Fondo</label>
              <input
                type="color"
                value={data.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="mt-1 block w-full h-10 rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alineación del Texto</label>
              <select
                value={data.textAlign || "left"}
                onChange={(e) => handleChange("textAlign", e.target.value as "left" | "center" | "right")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={data.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>

          {/* Campos específicos para cada sección */}
          {section === "hero" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">URL del Video</label>
                <input
                  type="text"
                  value={data.videoUrl || ""}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Texto del Botón</label>
                <input
                  type="text"
                  value={data.buttonText || ""}
                  onChange={(e) => handleChange("buttonText", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL del Botón</label>
                <input
                  type="text"
                  value={data.buttonUrl || ""}
                  onChange={(e) => handleChange("buttonUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color del Botón</label>
                <input
                  type="color"
                  value={data.buttonColor || "#1976d2"}
                  onChange={(e) => handleChange("buttonColor", e.target.value)}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300"
                />
              </div>
            </div>
          )}

          {section === "about" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título Conócenos</label>
                <input
                  type="text"
                  value={data.conocenosTitle || ""}
                  onChange={(e) => handleChange("conocenosTitle", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Título ¿Qué es ASONIPED?</label>
                <input
                  type="text"
                  value={data.whatIsTitle || ""}
                  onChange={(e) => handleChange("whatIsTitle", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción ¿Qué es ASONIPED?</label>
                <textarea
                  value={data.whatIsDescription || ""}
                  onChange={(e) => handleChange("what
