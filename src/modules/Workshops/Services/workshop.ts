export interface Workshop {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  materials: string[];
  learnText: string;
   location: string; // Nuevo
  date: string;     // Nuevo
  time: string;  
  participants: number;      // Número de participantes (nuevo)
  slotsAvailable: number;    // Cupos disponibles (nuevo)
}


export interface WorkshopEnrollment {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  workshopId: string; 
}

export interface WorkshopOption {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;      // YYYY-MM-DD
  time?: string;     // HH:MM (24h)
  location: string;
  skills?: string;
  tools?: string;
  capacity?: number; // Cantidad máxima de asistentes
}