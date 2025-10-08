export type WorkshopForm = {
  id: string; // identificador único de la inscripción
  personalInfo: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  asistencia?: boolean; // true = asistió, false = no, undefined = aún no definido
  workshopOptionId: string; // referencia al taller seleccionado
  workshopTitle?: string;   // título opcional (normalmente viene desde WorkshopOption)
  fechaInscripcion: string; // ISO string "2025-10-01T10:00:00Z"
  status: "pending" | "approved" | "rejected" | "enrolled" | "cancelled";
};


export type WorkshopOption = {
  id: string;   // ID del taller
  title: string; // nombre o título del taller
};


export type BackendWorkshop = {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  asistencia?: boolean;
  workshop_option_id: number; // en backend suele venir en snake_case
  workshop_title?: string;
  fecha_inscripcion: string;
  status: "pending" | "approved" | "rejected";
};
// Mapeo entre BackendWorkshop y WorkshopForm 
export interface Workshop {
  id: number;
  titulo: string;
  ubicacion: string;
  descripcion: string;
  materiales: string[];
  aprender: string;
  imagen: string;
  fecha: string;
  hora: string;
  capacidad: number;
  // Enrollment-related fields
  is_enrolled?: boolean;
  available_spots?: number;
  enrolled_count?: number;
}

export interface WorkshopEnrollment {
  id: number;
  user_id: number;
  workshop_id: number;
  status: 'enrolled' | 'cancelled';
  enrollment_date: string;
  cancellation_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkshopEnrollmentWithDetails extends WorkshopEnrollment {
  user_name: string;
  user_email: string;
  workshop_title: string;
  workshop_fecha: string;
  workshop_hora: string;
  workshop_ubicacion: string;
}
