import type { WorkshopForm, WorkshopOption } from "../Types/workshop";


export const fetchWorkshopForms = async (
  page = 1,
  limit = 10
): Promise<{ inscripciones: WorkshopForm[]; total: number; page: number; limit: number }> => {
 
  return {
    inscripciones: [],
    total: 0,
    page,
    limit,
  };
};


export const addWorkshopForm = async () => {
  
  return { message: "Inscripción creada (mock)" };
};


export const updateWorkshopFormStatus = async () => {
  
  return { message: "Estado actualizado (mock)" };
};


export const fetchWorkshopOptions = async (): Promise<WorkshopOption[]> => {
  
  return [];
};