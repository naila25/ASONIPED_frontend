import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, startTransition } from "react";
import { LayoutTemplate } from "lucide-react";
import { FaRocket, FaInfoCircle, FaHandsHelping, FaDonate, FaQuoteLeft } from "react-icons/fa";
import AttendancePageHeader from "../../Attendance/Components/AttendancePageHeader";
import type { AllSectionData, SectionData, SectionKey, DonationSection, LandingWorkshop } from "../Types/types";
import { heroService } from "../Services/heroService";
import { aboutService } from "../Services/aboutService";
import { donationService } from "../Services/donationService";
import { volunteerLandingService } from "../Services/volunteerLandingService";
import { landingWorkshopService } from "../Services/workshopService";
import { historiasLandingService } from "../Services/historiasLandingService";

const LandingSectionEditor = lazy(() =>
  import("./LandingSectionEditor").then((m) => ({ default: m.LandingSectionEditor }))
);

/** Referencia estable cuando no hay taller en la lista (evita objetos nuevos en cada render). */
const EMPTY_WORKSHOP: LandingWorkshop = {
  titulo: "",
  titulo_card: "",
  descripcion_card: "",
  imagen_card: "",
  texto_boton_card: "",
  color_boton_card: "#ff6600",
  fondo: "",
};

const CARD_COLORS = [
  { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-600", colorText: "text-blue-500", hoverBg: "hover:bg-blue-100" },
  { border: "border-purple-500", bg: "bg-purple-100", text: "text-purple-600", colorText: "text-purple-500", hoverBg: "hover:bg-purple-100" },
  { border: "border-orange-500", bg: "bg-orange-100", text: "text-orange-600", colorText: "text-orange-500", hoverBg: "hover:bg-orange-100" },
  { border: "border-pink-500", bg: "bg-pink-100", text: "text-pink-600", colorText: "text-pink-500", hoverBg: "hover:bg-pink-100" },
  { border: "border-teal-500", bg: "bg-teal-100", text: "text-teal-600", colorText: "text-teal-500", hoverBg: "hover:bg-teal-100" },
];

const landingSections: {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "hero", label: "Hero Section", icon: <FaRocket size={20} /> },
  { key: "about", label: "Sobre Nosotros", icon: <FaInfoCircle size={20} /> },
  { key: "volunteering", label: "Voluntariado", icon: <FaHandsHelping size={20} /> },
  { key: "donation", label: "Donaciones", icon: <FaDonate size={20} /> },
  { key: "testimonials", label: "Historias de vida", icon: <FaQuoteLeft size={20} /> },
];

export default function GestionLanding() {
  const user = { role: "admin" };

  const [modalOpen, setModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey | null>(null);
  /** Bumps when opening the editor so the lazy child remounts with a clean tree (avoids stale state bleed). */
  const [editorMountKey, setEditorMountKey] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    workshop: [],
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
      testimonialsTitle: "Testimonios", testimonialsDescription: "", testimonials: [], testimonialsTitleColor: "#ea580c",
    },
  });

  const [sectionStats, setSectionStats] = useState<Record<SectionKey, { count: number; title: string; hasImage: boolean }>>({
    hero: { count: 0, title: "Sin configurar", hasImage: false },
    about: { count: 0, title: "Sin configurar", hasImage: false },
    volunteering: { count: 0, title: "Sin configurar", hasImage: false },
    donation: { count: 0, title: "Sin configurar", hasImage: false },
    workshop: { count: 0, title: "Sin configurar", hasImage: false },
    footer: { count: 0, title: "Sin configurar", hasImage: false },
    location: { count: 0, title: "Sin configurar", hasImage: false },
    testimonials: { count: 0, title: "Sin configurar", hasImage: false },
  });

  useEffect(() => {
    const loadSectionData = async () => {
      try {
        const [
          heroData,
          aboutData,
          volunteerData,
          donationData,
          workshopData,
          historias,
        ] = await Promise.all([
          heroService.getAll().catch(() => [] as Awaited<ReturnType<typeof heroService.getAll>>),
          aboutService.getAll().catch(() => [] as Awaited<ReturnType<typeof aboutService.getAll>>),
          volunteerLandingService.getAll().catch(() => [] as Awaited<ReturnType<typeof volunteerLandingService.getAll>>),
          donationService.getSection().catch(() => null),
          landingWorkshopService.getAll().catch(() => [] as Awaited<ReturnType<typeof landingWorkshopService.getAll>>),
          historiasLandingService.getSection().catch(() => null),
        ]);

        setSectionStats((prev) => {
          let next = { ...prev };
          if (heroData.length > 0) {
            const hero = heroData[0];
            next = {
              ...next,
              hero: {
                count: heroData.length,
                title: hero.titulo || "Hero Section",
                hasImage: !!hero.url_imagen,
              },
            };
          }
          if (aboutData.length > 0) {
            const about = aboutData[0];
            next = {
              ...next,
              about: {
                count: aboutData.length,
                title: about.titulo || "Sobre Nosotros",
                hasImage: !!about.URL_imagen,
              },
            };
          }
          if (volunteerData.length > 0) {
            const volunteer = volunteerData[0];
            next = {
              ...next,
              volunteering: {
                count: volunteerData.length,
                title: volunteer.titulo || "Voluntariado",
                hasImage: !!volunteer.URL_imagen,
              },
            };
          }
          if (donationData) {
            next = {
              ...next,
              donation: {
                count: donationData.cards?.length || 0,
                title: donationData.header?.titulo || "Donaciones",
                hasImage: donationData.cards?.some((card) => !!card.URL_imagen) || false,
              },
            };
          }
          next = {
            ...next,
            workshop: {
              count: workshopData.length,
              title: workshopData[0]?.titulo_card || "Talleres",
              hasImage: !!workshopData[0]?.imagen_card,
            },
          };
          const historiasHeader = historias?.header;
          if (historias && historiasHeader) {
            next = {
              ...next,
              testimonials: {
                count: historias.items.length,
                title: historiasHeader.titulo || "Testimonios",
                hasImage: false,
              },
            };
          } else if (historias) {
            next = {
              ...next,
              testimonials: {
                count: historias.items.length,
                title: "Testimonios",
                hasImage: false,
              },
            };
          }
          return next;
        });

        setSectionData((prev) => {
          let next: AllSectionData = { ...prev, workshop: workshopData };
          if (donationData) {
            next = { ...next, donation: donationData };
          }
          const historiasHeader = historias?.header;
          if (historias && historiasHeader) {
            next = {
              ...next,
              testimonials: {
                ...prev.testimonials,
                testimonialsTitle: historiasHeader.titulo,
                testimonialsDescription: historiasHeader.descripcion,
                testimonialsTitleColor: "#ea580c",
                testimonials: historias.items,
              },
            };
          }
          return next;
        });
      } catch (error) {
        console.error("Error loading section data:", error);
      }
    };

    loadSectionData();
  }, []);

  const handlePersonalize = useCallback((sectionKey: SectionKey) => {
    setCurrentSection(sectionKey);
    setEditorMountKey((k) => k + 1);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSectionUpdate = useCallback(
    (partial: Partial<SectionData> | Partial<LandingWorkshop>) => {
      if (!currentSection) return;
      startTransition(() => {
        setSectionData((prev) => ({
          ...prev,
          [currentSection]: { ...prev[currentSection], ...partial },
        }));
      });
    },
    [currentSection]
  );

  const editorInitialData = useMemo((): SectionData | LandingWorkshop => {
    if (!currentSection) {
      return sectionData.hero as SectionData;
    }
    if (currentSection === "workshop") {
      return (sectionData.workshop[0] ?? EMPTY_WORKSHOP) as LandingWorkshop;
    }
    return sectionData[currentSection] as SectionData;
  }, [currentSection, sectionData]);

  const handleSave = useCallback(
    async (data: SectionData | DonationSection | LandingWorkshop) => {
      if (!currentSection) return;
      if (currentSection === "donation") {
        setSectionData((prev) => ({ ...prev, donation: data as DonationSection }));
      } else if (currentSection === "testimonials") {
        setSectionData((prev) => ({ ...prev, testimonials: data as SectionData }));
        const t = data as SectionData;
        setSectionStats((prev) => ({
          ...prev,
          testimonials: {
            count: t.testimonials?.length ?? 0,
            title: t.testimonialsTitle || "Testimonios",
            hasImage: false,
          },
        }));
      } else if (currentSection === "workshop") {
        const input = data as LandingWorkshop;
        if (input.id) {
          await landingWorkshopService.update(input.id, input);
        } else {
          await landingWorkshopService.create(input);
        }
        const workshopData = await landingWorkshopService.getAll();
        setSectionData((prev) => ({ ...prev, workshop: workshopData }));
        setSectionStats((prev) => ({
          ...prev,
          workshop: {
            count: workshopData.length,
            title: workshopData[0]?.titulo_card || "Talleres",
            hasImage: !!workshopData[0]?.imagen_card,
          },
        }));
        setMessage({ type: "success", text: "Cambios guardados correctamente." });
      } else {
        setSectionData((prev) => ({
          ...prev,
          [currentSection]: { ...prev[currentSection], ...(data as SectionData) },
        }));
      }
      setModalOpen(false);
      setMessage({ type: "success", text: "Cambios guardados correctamente." });

      if (currentSection !== "workshop") {
        const loadSectionData = async () => {
          try {
            if (currentSection === "hero") {
              const heroData = await heroService.getAll();
              if (heroData.length > 0) {
                const hero = heroData[0];
                setSectionStats((prev) => ({
                  ...prev,
                  hero: {
                    count: heroData.length,
                    title: hero.titulo || "Hero Section",
                    hasImage: !!hero.url_imagen,
                  },
                }));
              }
            } else if (currentSection === "about") {
              const aboutData = await aboutService.getAll();
              if (aboutData.length > 0) {
                const about = aboutData[0];
                setSectionStats((prev) => ({
                  ...prev,
                  about: {
                    count: aboutData.length,
                    title: about.titulo || "Sobre Nosotros",
                    hasImage: !!about.URL_imagen,
                  },
                }));
              }
            } else if (currentSection === "volunteering") {
              const volunteerData = await volunteerLandingService.getAll();
              if (volunteerData.length > 0) {
                const volunteer = volunteerData[0];
                setSectionStats((prev) => ({
                  ...prev,
                  volunteering: {
                    count: volunteerData.length,
                    title: volunteer.titulo || "Voluntariado",
                    hasImage: !!volunteer.URL_imagen,
                  },
                }));
              }
            } else if (currentSection === "donation") {
              const donationData = await donationService.getSection();
              if (donationData) {
                setSectionStats((prev) => ({
                  ...prev,
                  donation: {
                    count: donationData.cards?.length || 0,
                    title: donationData.header?.titulo || "Donaciones",
                    hasImage: donationData.cards?.some((card) => !!card.URL_imagen) || false,
                  },
                }));
                setSectionData((prev) => ({
                  ...prev,
                  donation: donationData,
                }));
              }
            } else if (currentSection === "testimonials") {
              const historias = await historiasLandingService.getSection();
              setSectionStats((prev) => ({
                ...prev,
                testimonials: {
                  count: historias.items.length,
                  title: historias.header?.titulo || "Testimonios",
                  hasImage: false,
                },
              }));
              setSectionData((prev) => ({
                ...prev,
                testimonials: {
                  ...prev.testimonials,
                  testimonialsTitle: historias.header?.titulo ?? "",
                  testimonialsDescription: historias.header?.descripcion ?? "",
                  testimonialsTitleColor: "#ea580c",
                  testimonials: historias.items,
                },
              }));
            }
          } catch (error) {
            console.error("Error reloading section data:", error);
          }
        };
        loadSectionData();
      }
    },
    [currentSection]
  );

  if (user.role !== "admin") {
    return <p className="text-red-500">Acceso denegado. Solo administradores pueden entrar aquí.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        icon={<LayoutTemplate className="h-6 w-6" />}
        title="Gestión del landing"
        description="Edita las secciones públicas del sitio: hero, sobre nosotros, voluntariado, donaciones y testimonios."
        showSubNav={false}
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        {message && (
          <div
            className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message.text}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {landingSections.map((sec, i) => {
            const cardColor = CARD_COLORS[i % CARD_COLORS.length];
            const stats = sectionStats[sec.key];
            return (
              <div key={sec.key} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${cardColor.border}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{sec.label}</p>
                    <p className="text-lg font-bold text-gray-900 truncate" title={stats.title}>
                      {stats.title}
                    </p>
                  </div>
                  <div className={`p-3 ${cardColor.bg} rounded-lg flex-shrink-0`}>
                    <span className={`${cardColor.text}`}>{sec.icon}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`mt-4 w-full text-center text-sm font-medium ${cardColor.colorText} ${cardColor.hoverBg} py-2 rounded transition-colors duration-200`}
                  onClick={() => handlePersonalize(sec.key)}
                >
                  {stats.count > 0 ? "Editar" : "Editar"}
                </button>
              </div>
            );
          })}
        </div>
        {modalOpen && currentSection !== null && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="rounded-lg bg-white px-8 py-6 shadow-xl">
                  <div className="text-gray-700">Cargando editor…</div>
                </div>
              </div>
            }
          >
            <LandingSectionEditor
              key={`${currentSection}-${editorMountKey}`}
              section={currentSection}
              initialData={editorInitialData}
              onSave={handleSave}
              onCancel={handleModalClose}
              onUpdate={handleSectionUpdate}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
