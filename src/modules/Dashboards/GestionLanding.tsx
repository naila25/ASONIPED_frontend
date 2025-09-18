import React, { useState } from "react";
import { FaRocket, FaInfoCircle, FaHandsHelping, FaMapMarked, FaCommentDots, FaRegSave } from "react-icons/fa";
 
import { LandingSectionEditor } from "./LandingSectionEditor";
import { PreviewModal } from "./PreviewModal";
import { SectionData, SectionKey } from "./types";

const landingSections: {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
}[] = [
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [sectionData, setSectionData] = useState<Record<SectionKey, SectionData>>({
    hero: {
      title: "", image: null, buttonColor: "#1976d2", backgroundColor: "#ffffff",
      textAlign: "left", videoUrl: "", description: "", titleColor: "#000000",
    },
    about: {
      title: "", image: null, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      conocenosTitle: "Conócenos", whatIsTitle: "¿Qué es ASONIPED?", whatIsDescription: "", whatTheyDoTitle: "¿Qué hacen?",
      whatTheyDoDescription: "", whatTheyDoImage: null, mission: "", vision: "", values: [],
      valuesPosition: "grid", aboutTitleColor: "#000000", whatIsTitleColor: "#000000", whatTheyDoTitleColor: "#000000",
      missionTitleColor: "#000000", visionTitleColor: "#000000", valuesTitleColor: "#000000",
    },
    volunteering: {
      title: "", image: null, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      volunteeringTitle: "Voluntariado", volunteeringDescription: "", volunteeringVisualType: "image",
      volunteeringVisual: "", volunteerTypes: [], volunteeringTitleColor: "#000000", volunteerTypeTitleColor: "#000000",
    },
    footer: {
      title: "", image: null, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      footer: { companyName: "", logo: null, phone: "", email: "", schedule: "", locationText: "", order: ["company", "contacts", "location", "schedule"] },
      footerTitleColor: "#000000",
    },
    location: {
      title: "", image: null, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      locationTitle: "Ubicación", locationLink: "", locationTitleColor: "#000000",
    },
    testimonials: {
      title: "", image: null, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      testimonialsTitle: "Testimonios", testimonialsDescription: "", testimonials: [], testimonialsTitleColor: "#000000",
    },
  });

  if (user.role !== "admin") {
    return <p className="text-red-500">Acceso denegado. Solo administradores pueden entrar aquí.</p>;
  }

  const handlePersonalize = (sectionKey: SectionKey) => {
    setCurrentSection(sectionKey);
    setModalOpen(true);
  };

  const handleSave = (data: SectionData) => {
    if (!currentSection) return;
    setSectionData((prev) => ({ ...prev, [currentSection]: { ...prev[currentSection], ...data } }));
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
      {message && (
        <div className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}
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
                  <span className={`${cardColor.text}`}>{sec.icon}</span>
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
      <div className="mt-6">
        <button
          onClick={() => setPreviewOpen(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Vista previa
        </button>
      </div>
      {modalOpen && currentSection !== null && (
        <LandingSectionEditor
          section={currentSection}
          initialData={sectionData[currentSection]}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          onUpdate={(partial) => {
            if (!currentSection) return;
            setSectionData((prev) => ({ ...prev, [currentSection]: { ...prev[currentSection], ...partial } }));
          }}
        />
      )}
      {previewOpen && (
        <PreviewModal
          sectionData={sectionData}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}