export type SectionKey = | "hero" | "about" | "donation" | "volunteering" | "location" | "testimonials" | "footer" | "workshop";

export interface ValueItem {
  label: string;
  text: string;
  icon?: string;
  position?: "left" | "center" | "right";
}

export interface VolunteerType {
  id: string;
  title: string;
  description: string;
  image?: string;
  skills?: string[];
  tools?: string[];
  date?: string;
  location?: string;
  formEditable?: boolean;
  formQuestions?: { id: string; question: string }[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  image?: string;
  role?: string;
}

export interface FooterData {
  companyName: string;
  logo?: string;
  phone: string;
  email: string;
  schedule: string;
  locationText: string;
  order: string[];
}

// -------------------------------------------
// DONATION SECTION TYPES
// -------------------------------------------
export interface DonationsCard {
  id?: number;
  titulo_card: string;
  descripcion_card: string;
  URL_imagen: string;
  texto_boton: string;
  color_boton: string;
}

export interface DonationSection {
  header: {
    titulo: string;
    descripcion: string;
  };
  cards: DonationsCard[];
}

// -------------------------------------------
// WORKSHOP SECTION TYPE
// -------------------------------------------
export interface LandingWorkshop {
  id?: number;
  titulo: string;
  titulo_card: string;
  descripcion_card: string;
  imagen_card: string;
  texto_boton_card: string;
  color_boton_card: string;
  fondo: string;
}

// -------------------------------------------

export interface SectionData {
  // Common properties
  title?: string;
  titleColor?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  description?: string;
  image?: string | null;
  buttonColor?: string;
  buttonText?: string;
  buttonUrl?: string;
  videoUrl?: string;

  // About specific
  conocenosTitle?: string;
  aboutTitleColor?: string;
  whatIsTitle?: string;
  whatIsTitleColor?: string;
  whatIsDescription?: string;
  whatTheyDoTitle?: string;
  whatTheyDoTitleColor?: string;
  whatTheyDoDescription?: string;
  whatTheyDoImage?: string | null;
  mission?: string;
  missionTitleColor?: string;
  vision?: string;
  visionTitleColor?: string;
  values?: ValueItem[];
  valuesPosition?: "grid" | "list";
  valuesTitleColor?: string;

  // Volunteering specific
  volunteeringTitle?: string;
  volunteeringTitleColor?: string;
  volunteeringDescription?: string;
  volunteeringVisualType?: "image" | "video";
  volunteeringVisual?: string;
  volunteerTypes?: VolunteerType[];
  volunteerTypeTitleColor?: string;

  // Location specific
  locationTitle?: string;
  locationTitleColor?: string;
  locationLink?: string;

  // Testimonials specific
  testimonialsTitle?: string;
  testimonialsTitleColor?: string;
  testimonialsDescription?: string;
  testimonials?: TestimonialItem[];

  // Footer specific
  footer?: FooterData;
  footerTitleColor?: string;

  // DONATION SECTION (solo si quieres acceso desde SectionData)
  donation?: DonationSection;
}

// ************* EXPORTA EL TIPO GLOBAL ******************
export type AllSectionData = {
  hero: SectionData;
  about: SectionData;
  volunteering: SectionData;
  donation: DonationSection;
  workshop: LandingWorkshop[]; // <- array de talleres para el landing
  footer: SectionData;
  location: SectionData;
  testimonials: SectionData;
};