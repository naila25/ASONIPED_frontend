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

export interface VolunteerOption {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
} 