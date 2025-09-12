import React, { useState } from "react";
import { FaRocket, FaInfoCircle, FaHandsHelping, FaMapMarked, FaCommentDots, FaRegSave } from "react-icons/fa";

type SectionKey = "hero" | "about" | "volunteering" | "footer" | "location" | "testimonials";

interface SectionData {
  title: string;
  image: string | File | null;
  buttonColor: string;
}

const landingSections: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "hero", label: "Hero Section", icon: <FaRocket size={20} /> },
  { key: "about", label: "Sobre Nosotros", icon: <FaInfoCircle size={20} /> },
  { key: "volunteering", label: "Voluntariado", icon: <FaHandsHelping size={20} /> },
  { key: "footer", label: "Footer", icon: <FaRegSave size={20} /> },
  { key: "location", label: "Ubicación", icon: <FaMapMarked size={20} /> },
  { key: "testimonials", label: "Testimonios", icon: <FaCommentDots size={20} /> },
];

export default function GestionLanding() {
  const user = { role: "admin" };

  const [modalOpen, setModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey | null>(null);
  const [sectionData, setSectionData] = useState<Record<SectionKey, SectionData>>({
    hero: { title: "", image: null, buttonColor: "#1976d2" },
    about: { title: "", image: null, buttonColor: "#1976d2" },
    volunteering: { title: "", image: null, buttonColor: "#1976d2" },
    footer: { title: "", image: null, buttonColor: "#1976d2" },
    location: { title: "", image: null, buttonColor: "#1976d2" },
    testimonials: { title: "", image: null, buttonColor: "#1976d2" },
  });

  if (user.role !== "admin") {
    return <p className="text-red-500">No tienes permisos para acceder a este módulo</p>;
  }

  const handlePersonalize = (sectionKey: SectionKey) => {
    setCurrentSection(sectionKey);
    setModalOpen(true);
  };

  const handleSave = (data: SectionData) => {
    if (!currentSection) return;
    setSectionData((prev) => ({ ...prev, [currentSection]: data }));
    setModalOpen(false);
  };

  const colorClasses = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión del Landing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {landingSections.map((sec, i) => {
          const current = sectionData[sec.key];
          const color = colorClasses[i % colorClasses.length];

          return (
            <div
              key={sec.key}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg text-white ${color}`}>
                  {sec.icon}
                </div>
                <div>
                  <h2 className="text-md font-semibold">{sec.label}</h2>
                  <p className="text-sm text-gray-500">
                    {current.title ? `Título: ${current.title}` : "Sin personalizar"}
                  </p>
                </div>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md self-end"
                onClick={() => handlePersonalize(sec.key)}
              >
                Personalizar
              </button>
            </div>
          );
        })}
      </div>

      {modalOpen && currentSection !== null && (
        <ModalSimple onClose={() => setModalOpen(false)}>
          <LandingSectionEditor
            section={currentSection}
            initialData={sectionData[currentSection]}
            onSave={handleSave}
          />
        </ModalSimple>
      )}
    </div>
  );
}

// Modal simple
function ModalSimple({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320, position: "relative" }}>
        <button style={{ position: "absolute", top: 8, right: 8 }} onClick={onClose}>
          X
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
  const [image, setImage] = useState<File | string | null>(initialData?.image || null);
  const [buttonColor, setButtonColor] = useState(initialData?.buttonColor || "#1976d2");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, image, buttonColor });
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
      <input type="file" onChange={handleImageChange} className="border rounded px-2 py-1 w-full" />

      <label className="block">Color de Botón:</label>
      <input
        type="color"
        value={buttonColor}
        onChange={(e) => setButtonColor(e.target.value)}
        className="w-16 h-8"
      />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Guardar
      </button>
    </form>
  );
}
