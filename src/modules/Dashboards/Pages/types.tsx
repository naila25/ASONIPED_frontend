export interface VolunteerType {
  title: string;
  description: string;
  image?: string;
}

export interface Testimonial {
  name: string;
  text: string;
  image?: string;
  role?: string;
}

export interface SectionData {
  // ...
  volunteerTypes?: VolunteerType[];
  testimonials?: Testimonial[];
  // ...
}
