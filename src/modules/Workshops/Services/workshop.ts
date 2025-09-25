export interface Workshop {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  objectives: string[];
  materials: string[];
  learnText: string;
   location: string; // Nuevo
  date: string;     // Nuevo
  time: string;  
}

export interface WorkshopEnrollment {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  workshopId: string; 
}
