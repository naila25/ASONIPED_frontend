// Volunteer form data structure
export interface VolunteerForm {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: string;
  };
  availability: {
    days: string[];
    timeSlots: string[];
  };
  skills: string;
  motivation: string;
  volunteerOptionId: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Volunteer opportunity/option data structure
export interface VolunteerOption {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  skills?: string;
  tools?: string;
}

// Standard API error structure
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Volunteer entity as stored in the backend
export interface Volunteer {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  age?: string;
  availability_days?: string;
  availability_time_slots?: string;
  interests?: string;
  skills?: string;
  motivation?: string;
  status?: 'pending' | 'approved' | 'rejected';
  submission_date?: string;
}

// Volunteer enrollment data structure
export interface VolunteerEnrollment {
  volunteer_id: number;
  status: string;
  submission_date: string;
  option_id: number;
  option_title: string;
  option_description: string;
  option_imageUrl?: string;
  option_date?: string;
  option_location?: string;
  option_skills?: string;
  option_tools?: string;
}

// Volunteer proposal data structure
export interface VolunteerProposal {
  id: number;
  user_id: number;
  title: string;
  proposal: string;
  location: string;
  date: string;
  tools?: string;
  document_path?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  full_name?: string;
  email?: string;
} 