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