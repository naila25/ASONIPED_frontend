export type SectionKey = "hero" | "about" | "volunteering" | "location" | "testimonials" | "footer";

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

  // Hero specific
  // (uses common properties)

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
}
