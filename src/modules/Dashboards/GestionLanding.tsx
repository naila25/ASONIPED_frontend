import React, { useState } from "react";
import {
  FaRocket,
  FaInfoCircle,
  FaHandsHelping,
  FaMapMarked,
  FaCommentDots,
  FaRegSave,
} from "react-icons/fa";

type SectionKey =
  | "hero"
  | "about"
  | "volunteering"
  | "footer"
  | "location"
  | "testimonials";

interface SectionData {
  title: string;
  image: string | File | null;
  buttonColor: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
}

const landingSections: {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "hero", label: "Hero Section", icon: <FaRocket size={20} /> },
  { key: "about", label: "Sobre Nosotros", icon: <FaInfoCircle size={20} /> },
  {
    key: "volunteering",
    label: "Voluntariado",
    icon: <FaHandsHelping size={20} />,
  },
  { key: "footer", label: "Footer", icon: <FaRegSave size={20} /> },
  { key: "location", label: "Ubicación", icon: <FaMapMarked size={20} /> },
  {
    key: "testimonials",
    label: "Testimonios",
    icon: <FaCommentDots size={20} />,
  },
];

export default function GestionLanding() {
  const user = { role: "admin" };

  // Estados principales
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [sectionData, setSectionData] = useState<Record<SectionKey, SectionData>>({
    hero: { title: "", image: null, buttonColor: "#1976d2" },
    about: { title: "", image: null, buttonColor: "#1976d2" },
    volunteering: { title: "", image: null, buttonColor: "#1976d2" },
    footer: { title: "", image: null, buttonColor: "#1976d2" },
    location: { title: "", image: null, buttonColor: "#1976d2" },
    testimonials: { title: "", image: null, buttonColor: "#1976d2" },
  });

  // Restricción de acceso solo admins
  if (user.role !== "admin") {
    return <p className="text-red-500">Acceso denegado. Solo administradores pueden entrar aquí.</p>;
  }

  const handlePersonalize = (sectionKey: SectionKey) => {
    setCurrentSection(sectionKey);
    setModalOpen(true);
  };

  const handleSave = (data: SectionData) => {
    if (!currentSection) return;

    // Validaciones básicas
    if (!data.title.trim()) {
      setMessage({ type: "error", text: "El título no puede estar vacío." });
      return;
    }
    if (data.buttonUrl && !/^https?:\/\/.+/.test(data.buttonUrl)) {
      setMessage({ type: "error", text: "La URL no es válida." });
      return;
    }

    setSectionData((prev) => ({ ...prev, [currentSection]: data }));
    setModalOpen(false);
    setMessage({ type: "success", text: "Cambios guardados correctamente." });
  };

  const cardColors = [
    { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-600", colorText: "text-blue-500" },
    { border: "border-purple-500", bg: "bg-purple-100", text: "text-purple-600", colorText: "text-purple-500" },
    { border: "border-orange-500", bg: "bg-orange-100", text: "text-orange-600", colorText: "text-orange-500" },
    { border: "border-indigo-500", bg: "bg-indigo-100", text: "text-indigo-600", colorText: "text-indigo-500" },
    { border: "border-teal-500", bg: "bg-teal-100", text: "text-teal-600", colorText: "text-teal-500" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión del Landing</h1>

      {/* Mensajes de éxito/error */}
      {message && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* --- Sección de Cards Dinámicas con el Nuevo Diseño --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {landingSections.map((sec, i) => {
          const cardColor = cardColors[i % cardColors.length];

          return (
            <div key={sec.key} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${cardColor.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{sec.label}</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">
                    <span className={cardColor.colorText}>+ 0</span> nuevos
                  </p>
                </div>
                <div className={`p-3 ${cardColor.bg} rounded-lg`}>
                  <span className={`${cardColor.text}`}>
                    {sec.icon}
                  </span>
                </div>
              </div>
              <button
                className={`mt-4 w-full text-center text-sm font-medium ${cardColor.colorText}`}
                onClick={() => handlePersonalize(sec.key)}
              >
                Personalizar
              </button>
            </div>
          );
        })}
      </div>
      {/* --- Fin de la sección de Cards --- */}

      {/* Botón de vista previa */}
      <div className="mt-6">
        <button
          onClick={() => setPreviewOpen(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Vista previa
        </button>
      </div>

      {/* Modal editor */}
      {modalOpen && currentSection !== null && (
        <ModalSimple onClose={() => setModalOpen(false)}>
          <LandingSectionEditor
            section={currentSection}
            initialData={sectionData[currentSection]}
            onSave={handleSave}
          />
        </ModalSimple>
      )}

      {/* Modal vista previa */}
      {previewOpen && (
        <ModalSimple onClose={() => setPreviewOpen(false)}>
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-2">Vista Previa del Landing</h2>
            {Object.entries(sectionData).map(([key, data]) => (
              <div
                key={key}
                style={{
                  background: data.backgroundColor || "#f9f9f9",
                  textAlign: data.textAlign || "left",
                  padding: "12px",
                  borderRadius: "6px",
                }}
              >
                <h3 className="font-semibold">{data.title || "(Sin título)"}</h3>
                {data.image && (
                  <p className="text-sm text-gray-500">(Imagen cargada)</p>
                )}
                {data.buttonText && (
                  <a
                    href={data.buttonUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 px-3 py-1 text-white rounded"
                    style={{ background: data.buttonColor }}
                  >
                    {data.buttonText}
                  </a>
                )}
              </div>
            ))}
          </div>
        </ModalSimple>
      )}
    </div>
  );
}

// Modal simple
function ModalSimple({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-[320px] relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// Editor de secciones
function LandingSectionEditor({
  section,
  initialData,
  onSave,
}: {
  section: SectionKey;
  initialData: SectionData;
  onSave: (data: SectionData) => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [image, setImage] = useState<File | string | null>(
    initialData?.image || null
  );
  const [buttonColor, setButtonColor] = useState(
    initialData?.buttonColor || "#1976d2"
  );
  const [buttonText, setButtonText] = useState(initialData?.buttonText || "");
  const [buttonUrl, setButtonUrl] = useState(initialData?.buttonUrl || "");
  const [backgroundColor, setBackgroundColor] = useState(
    initialData?.backgroundColor || "#ffffff"
  );
  const [textAlign, setTextAlign] = useState<
    "left" | "center" | "right"
  >(initialData?.textAlign || "left");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      image,
      buttonColor,
      buttonText,
      buttonUrl,
      backgroundColor,
      textAlign,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">Personalizar {section}</h2>

      <label className="block">Título:</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded px-2 py-1 w-full"
        required
      />

      <label className="block">Foto:</label>
      <input
        type="file"
        onChange={handleImageChange}
        className="border rounded px-2 py-1 w-full"
      />

      <label className="block">Texto del Botón:</label>
      <input
        value={buttonText}
        onChange={(e) => setButtonText(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />

      <label className="block">URL del Botón:</label>
      <input
        value={buttonUrl}
        onChange={(e) => setButtonUrl(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />

      <label className="block">Color de Botón:</label>
      <input
        type="color"
        value={buttonColor}
        onChange={(e) => setButtonColor(e.target.value)}
        className="w-16 h-8"
      />

      <label className="block">Color de Fondo:</label>
      <input
        type="color"
        value={backgroundColor}
        onChange={(e) => setBackgroundColor(e.target.value)}
        className="w-16 h-8"
      />

      <label className="block">Alineación del Texto:</label>
      <select
        value={textAlign}
        onChange={(e) => setTextAlign(e.target.value as "left" | "center" | "right")}
        className="border rounded px-2 py-1 w-full"
      >
        <option value="left">Izquierda</option>
        <option value="center">Centro</option>
        <option value="right">Derecha</option>
      </select>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </form>
  );
}