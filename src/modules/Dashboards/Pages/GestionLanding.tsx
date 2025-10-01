import React, { useState, useEffect } from "react";
import { FaRocket, FaInfoCircle, FaHandsHelping} from "react-icons/fa";

import { LandingSectionEditor } from "./LandingSectionEditor";
import { PreviewModal } from "./PreviewModal";
import EditDonationSection from "./EditDonationSection";
import type { AllSectionData, SectionData, SectionKey, DonationSection } from "../Types/types";
import { heroService } from "../Services/heroService";
import { aboutService } from "../Services/aboutService";
import { donationService } from "../Services/donationService";
import { volunteerLandingService } from "../Services/volunteerLandingService";

const landingSections: {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "hero", label: "Hero Section", icon: <FaRocket size={20} /> },
  { key: "about", label: "Sobre Nosotros", icon: <FaInfoCircle size={20} /> },
  { key: "volunteering", label: "Voluntariado", icon: <FaHandsHelping size={20} /> },
  { key: "donation", label: "Donaciones", icon: <FaHandsHelping size={20} /> },
];

export default function GestionLanding() {
  const user = { role: "admin" };

  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ¡Tipo global corregido aquí!
  const [sectionData, setSectionData] = useState<AllSectionData>({
    hero: {
      title: "", image: undefined, buttonColor: "#1976d2", backgroundColor: "#ffffff",
      textAlign: "left", videoUrl: "", description: "", titleColor: "#000000",
    },
    about: {
      title: "", image: undefined, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      conocenosTitle: "Conócenos", whatIsTitle: "¿Qué es ASONIPED?", whatIsDescription: "", whatTheyDoTitle: "¿Qué hacen?",
      whatTheyDoDescription: "", whatTheyDoImage: undefined, mission: "", vision: "", values: [],
      valuesPosition: "grid", aboutTitleColor: "#000000", whatIsTitleColor: "#000000", whatTheyDoTitleColor: "#000000",
      missionTitleColor: "#000000", visionTitleColor: "#000000", valuesTitleColor: "#000000",
    },
    volunteering: {
      title: "", image: undefined, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      volunteeringTitle: "Voluntariado", volunteeringDescription: "", volunteeringVisualType: "image",
      volunteeringVisual: "", volunteerTypes: [], volunteeringTitleColor: "#000000", volunteerTypeTitleColor: "#000000",
    },
    donation: {
      header: { titulo: "", descripcion: "" },
      cards: [],
    },
    footer: {
      title: "", image: undefined, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      footer: { companyName: "", logo: undefined, phone: "", email: "", schedule: "", locationText: "", order: ["company", "contacts", "location", "schedule"] },
      footerTitleColor: "#000000",
    },
    location: {
      title: "", image: undefined, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      locationTitle: "Ubicación", locationLink: "", locationTitleColor: "#000000",
    },
    testimonials: {
      title: "", image: undefined, buttonColor: "#1976d2", backgroundColor: "#ffffff", textAlign: "left",
      testimonialsTitle: "Testimonios", testimonialsDescription: "", testimonials: [], testimonialsTitleColor: "#000000",
    },
  });

  const [sectionStats, setSectionStats] = useState<Record<SectionKey, { count: number; title: string; hasImage: boolean }>>({
    hero: { count: 0, title: "Sin configurar", hasImage: false },
    about: { count: 0, title: "Sin configurar", hasImage: false },
    volunteering: { count: 0, title: "Sin configurar", hasImage: false },
    donation: { count: 0, title: "Sin configurar", hasImage: false },
    footer: { count: 0, title: "Sin configurar", hasImage: false },
    location: { count: 0, title: "Sin configurar", hasImage: false },
    testimonials: { count: 0, title: "Sin configurar", hasImage: false },
  });

  useEffect(() => {
    const loadSectionData = async () => {
      try {
        // Load Hero data
        const heroData = await heroService.getAll();
        if (heroData.length > 0) {
          const hero = heroData[0];
          setSectionStats(prev => ({
            ...prev,
            hero: {
              count: heroData.length,
              title: hero.titulo || "Hero Section",
              hasImage: !!hero.url_imagen
            }
          }));
        }

        // Load About data
        const aboutData = await aboutService.getAll();
        if (aboutData.length > 0) {
          const about = aboutData[0];
          setSectionStats(prev => ({
            ...prev,
            about: {
              count: aboutData.length,
              title: about.titulo || "Sobre Nosotros",
              hasImage: !!about.URL_imagen
            }
          }));
        }

        // Load Volunteers data
        const volunteerData = await volunteerLandingService.getAll();
        if (volunteerData.length > 0) {
          const volunteer = volunteerData[0];
          setSectionStats(prev => ({
            ...prev,
            volunteering: {
              count: volunteerData.length,
              title: volunteer.titulo || "Voluntariado",
              hasImage: !!volunteer.URL_imagen
            }
          }));
        }

        // Load Donations data
        const donationData = await donationService.getSection();
        if (donationData) {
          setSectionStats(prev => ({
            ...prev,
            donation: {
              count: donationData.cards.length,
              title: donationData.header.titulo || "Donaciones",
              hasImage: donationData.cards.some(card => !!card.URL_imagen)
            }
          }));
          setSectionData(prev => ({
            ...prev,
            donation: donationData,
          }));
        }
      } catch (error) {
        console.error('Error loading section data:', error);
      }
    };

    loadSectionData();
  }, []);

  if (user.role !== "admin") {
    return <p className="text-red-500">Acceso denegado. Solo administradores pueden entrar aquí.</p>;
  }

  const handlePersonalize = (sectionKey: SectionKey) => {
    setCurrentSection(sectionKey);
    setModalOpen(true);
  };

  // ¡OJO! handleSave debe diferenciar donation
  const handleSave = (data: SectionData | DonationSection) => {
    if (!currentSection) return;
    if (currentSection === "donation") {
      setSectionData(prev => ({ ...prev, donation: data as DonationSection }));
    } else {
      setSectionData(prev => ({
        ...prev,
        [currentSection]: { ...prev[currentSection], ...(data as SectionData) }
      }));
    }
    setModalOpen(false);
    setMessage({ type: "success", text: "Cambios guardados correctamente." });

    // Reload section data after save
    const loadSectionData = async () => {
      try {
        if (currentSection === "hero") {
          const heroData = await heroService.getAll();
          if (heroData.length > 0) {
            const hero = heroData[0];
            setSectionStats(prev => ({
              ...prev,
              hero: {
                count: heroData.length,
                title: hero.titulo || "Hero Section",
                hasImage: !!hero.url_imagen
              }
            }));
          }
        } else if (currentSection === "about") {
          const aboutData = await aboutService.getAll();
          if (aboutData.length > 0) {
            const about = aboutData[0];
            setSectionStats(prev => ({
              ...prev,
              about: {
                count: aboutData.length,
                title: about.titulo || "Sobre Nosotros",
                hasImage: !!about.URL_imagen
              }
            }));
          }
        } else if (currentSection === "volunteering") {
          const volunteerData = await volunteerLandingService.getAll();
          if (volunteerData.length > 0) {
            const volunteer = volunteerData[0];
            setSectionStats(prev => ({
              ...prev,
              volunteering: {
                count: volunteerData.length,
                title: volunteer.titulo || "Voluntariado",
                hasImage: !!volunteer.URL_imagen
              }
            }));
          }
        } else if (currentSection === "donation") {
          const donationData = await donationService.getSection();
          if (donationData) {
            setSectionStats(prev => ({
              ...prev,
              donation: {
                count: donationData.cards.length,
                title: donationData.header.titulo || "Donaciones",
                hasImage: donationData.cards.some(card => !!card.URL_imagen)
              }
            }));
            setSectionData(prev => ({
              ...prev,
              donation: donationData,
            }));
          }
        }
      } catch (error) {
        console.error('Error reloading section data:', error);
      }
    };

    loadSectionData();
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
          const stats = sectionStats[sec.key];
          return (
            <div key={sec.key} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${cardColor.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{sec.label}</p>
                  <p className="text-lg font-bold text-gray-900 truncate" title={stats.title}>
                    {stats.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {stats.hasImage && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        Con imagen
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-3 ${cardColor.bg} rounded-lg`}>
                  <span className={`${cardColor.text}`}>{sec.icon}</span>
                </div>
              </div>
              <button
                className={`mt-4 w-full text-center text-sm font-medium ${cardColor.colorText} hover:${cardColor.bg} py-2 rounded transition-colors`}
                onClick={() => handlePersonalize(sec.key)}
              >
                {stats.count > 0 ? 'Editar' : 'Configurar'}
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
        currentSection === "donation"
          ? <EditDonationSection
              initialData={sectionData.donation}
              onSave={handleSave}
              onCancel={() => setModalOpen(false)}
              onUpdate={(partial) => {
                setSectionData(prev => ({
                  ...prev,
                  donation: { ...prev.donation, ...partial }
                }));
              }}
            />
          : <LandingSectionEditor
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