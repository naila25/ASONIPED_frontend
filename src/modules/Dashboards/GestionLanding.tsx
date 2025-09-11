import React, { useState } from "react";
import { FaRocket, FaInfoCircle, FaAward, FaMapMarked, FaCommentDots, FaRegSave } from "react-icons/fa";

type SectionKey = "hero" | "about" | "achievements" | "footer" | "location" | "testimonials";
interface SectionData {
  title: string;
  image: string | File | null;
  buttonColor: string;
}

const landingSections: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "hero", label: "HeroSection", icon: <FaRocket size={30} /> },
  { key: "about", label: "AboutSection", icon: <FaInfoCircle size={30} /> },
  { key: "achievements", label: "Achievements", icon: <FaAward size={30} /> },
  { key: "footer", label: "Footer", icon: <FaRegSave size={30} /> },
  { key: "location", label: "LocationMap", icon: <FaMapMarked size={30} /> },
  { key: "testimonials", label: "Testimonials", icon: <FaCommentDots size={30} /> }
];

export default function GestionLanding() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey | null>(null);
  const [sectionData, setSectionData] = useState<Record<SectionKey, SectionData>>({
    hero: { title: "", image: null, buttonColor: "#1976d2" },
    about: { title: "", image: null, buttonColor: "#1976d2" },
    achievements: { title: "", image: null, buttonColor: "#1976d2" },
    footer: { title: "", image: null, buttonColor: "#1976d2" },
    location: { title: "", image: null, buttonColor: "#1976d2" },
    testimonials: { title: "", image: null, buttonColor: "#1976d2" }
  });

  const handlePersonalize = (sectionKey: SectionKey) => {
    setCurrentSection(sectionKey);
    setModalOpen(true);
  };

  const handleSave = (data: SectionData) => {
    if (!currentSection) return;
    setSectionData(prev => ({ ...prev, [currentSection]: data }));
    setModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión del Landing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {landingSections.map(sec => (
          <div key={sec.key} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            {sec.icon}
            <h2 className="font-semibold text-lg mb-2">{sec.label}</h2>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => handlePersonalize(sec.key)}
            >
              Personalizar
            </button>
          </div>
        ))}
      </div>
      {modalOpen && currentSection && (
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

function ModalSimple({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320, position: "relative" }}>
        <button style={{ position: "absolute", top: 8, right: 8 }} onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
}

function LandingSectionEditor({
  section,
  initialData,
  onSave
}: {
  section: SectionKey,
  initialData: SectionData,
  onSave: (data: SectionData) => void
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [image, setImage] = useState<File | string | null>(initialData?.image || null);
  const [buttonColor, setButtonColor] = useState(initialData?.buttonColor || "#1976d2");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0){
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
        onChange={e => setTitle(e.target.value)}
        className="border rounded px-2 py-1 w-full"
        required
      />
      <label className="block">Foto:</label>
      <input 
        type="file"
        onChange={handleImageChange}
        className="border rounded px-2 py-1 w-full"
      />
      <label className="block">Color de Botón:</label>
      <input 
        type="color"
        value={buttonColor}
        onChange={e => setButtonColor(e.target.value)}
        className="w-16 h-8"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
    </form>
  );
}