export interface Workshop {

  id: number;
  titulo: string;
  ubicacion: string;
  descripcion: string;
  materiales: string[]; // Array of materials
  aprender: string;
  imagen: string;
  fecha: string;
  hora: string;
  capacidad: number;

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